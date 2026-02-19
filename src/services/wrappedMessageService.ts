import protobuf from 'protobufjs';
import { Either, left, right } from './either';

/**
 * DATA FLOW: HTTP Bytes → UI Presentation
 * ========================================
 *
 * 1. HTTP Response: Server returns bytes (application/octet-stream)
 *    ↓
 * 2. cacheService.ts: Fetches bytes from REST endpoint
 *    ↓
 * 3. cacheRequestResponseMapper.toEntryFromBytes(): Converts bytes to CacheEntry
 *    ↓
 * 4. WrappedMessageService.decode(): Decodes WrappedMessage protobuf
 *    ↓
 * 5. extractWrappedData(): Extracts data from WrappedMessage structure
 *    ↓
 * 6. decodeByTypeId(): Uses TYPE_ID_MAP to decode specific message types
 *    ↓
 * 7. Decode functions (decodeJsonBucket, decodeSetBucket): Create BucketData
 *    ↓
 * 8. formatForDisplay(): Formats data for UI display
 *    ↓
 * 9. Stringify functions (optional): Custom formatting per type
 *    ↓
 * 10. ViewEntryModal.tsx: Displays formatted string in UI
 */

/**
 * Uniform structure for bucket types
 *
 * This structure is returned by decode functions and provides three representations:
 * - typeName: Identifies the bucket type (e.g., "JsonBucket", "SetBucket")
 * - displayValue: Pre-formatted string for UI display
 * - nativeValue: JS native representation (Object, Set, Map) for programmatic access
 */
export interface BucketData {
  typeName: string;      // e.g., "JsonBucket", "SetBucket"
  displayValue: string;  // Human-readable representation
  nativeValue: any;      // JS native: JSON object, Set, Map, Array, etc.
}

/**
 * Type for decode function in TYPE_ID_MAP
 *
 * Decode functions are called when a WrappedMessage contains a nested message with a typeId.
 * They receive:
 * - bytes: Raw protobuf bytes to decode
 * - obj: Already decoded protobuf object (for quick field access)
 * - typeId: Numeric type identifier from WrappedMessage
 * - service: Reference to WrappedMessageService for recursive decoding
 *
 * They return BucketData with typeName, displayValue, and nativeValue, or null on failure.
 */
type DecodeFunction = (bytes: Uint8Array, obj: any, typeId: number, service: typeof WrappedMessageService) => Promise<BucketData | null>;

/**
 * Type for stringify function in TYPE_ID_MAP
 *
 * Stringify functions are called by formatForDisplay() to allow custom formatting per type.
 * They receive WrappedMessageData with all decoded information including:
 * - displayValue: Pre-formatted string from decode function
 * - nativeValue: JS native representation (Set, Map, Object, etc.)
 * - typeId: Numeric type identifier
 *
 * They can return:
 * - Custom formatted string (overrides displayValue)
 * - null (falls back to displayValue)
 */
type StringifyFunction = (data: WrappedMessageData) => string | null;

/**
 * STEP 7a: Decode JsonBucket from protobuf object
 *
 * JsonBucket stores JSON data as UTF-8 encoded bytes in the 'value' field.
 * This function:
 * 1. Extracts the byte array from obj.value
 * 2. Decodes UTF-8 bytes to string
 * 3. Parses JSON string to JS object
 * 4. Returns BucketData with:
 *    - typeName: "JsonBucket"
 *    - displayValue: Pretty-printed JSON string
 *    - nativeValue: Parsed JS object
 */
const decodeJsonBucket: DecodeFunction = async (bytes, obj, typeId, service) => {
  // The 'value' field contains UTF-8 encoded JSON string
  if (obj.value && Array.isArray(obj.value)) {
    try {
      // Convert byte array to string
      const jsonString = new TextDecoder('utf-8').decode(new Uint8Array(obj.value));
      // Parse the JSON string
      const jsonValue = JSON.parse(jsonString);
      console.log(`Decoded JsonBucket (typeId ${typeId}):`, jsonValue);
      return {
        typeName: 'JsonBucket',
        displayValue: JSON.stringify(jsonValue, null, 2),
        nativeValue: jsonValue
      };
    } catch (error) {
      console.warn(`Failed to parse JsonBucket value as JSON:`, error);
      return null;
    }
  }
  return null;
};

/**
 * STEP 7b: Decode SetBucket and return uniform bucket structure
 *
 * SetBucket structure: SetBucket → wrappedValues[] → MultimapObjectWrapper → wrapper → MarshallableUserObject → bytes (WrappedMessage)
 *
 * This function:
 * 1. Loads persistence.multimap.proto schema
 * 2. Decodes SetBucket message from bytes
 * 3. Extracts wrappedValues array (each is a MultimapObjectWrapper)
 * 4. For each wrapper, extracts nested WrappedMessage bytes
 * 5. Recursively decodes each WrappedMessage (calls service.decode())
 * 6. Collects decoded values into an array
 * 7. Creates JS native Set from values
 * 8. Returns BucketData with:
 *    - typeName: "SetBucket"
 *    - displayValue: Formatted string like "Set(3) { 'a', 'b', 'c' }"
 *    - nativeValue: JS Set object for programmatic access
 */
const decodeSetBucket: DecodeFunction = async (bytes, obj, typeId, service) => {
  try {
    // Load the persistence.multimap.proto file
    const root = await service['loadProtoFile']('persistence.multimap.proto');
    
    // Lookup the SetBucket message type
    const SetBucketType = root.lookupType('org.infinispan.persistence.multimap.SetBucket');
    
    // Decode the SetBucket message
    const setBucket = SetBucketType.decode(bytes);
    
    // Get the wrappedValues field (array of MultimapObjectWrapper)
    const wrappedValues = (setBucket as any).wrappedValues || [];
    
    // Extract and decode each WrappedMessage from the nested structure
    const decodedValues: any[] = [];
    
    for (const wrappedValue of wrappedValues) {
      // Each wrappedValue is a MultimapObjectWrapper with a 'wrapper' field
      if (wrappedValue && wrappedValue.wrapper) {
        // wrapper is a MarshallableUserObject with a 'bytes' field
        const marshallableUserObject = wrappedValue.wrapper;
        if (marshallableUserObject && marshallableUserObject.bytes) {
          // The bytes field contains a WrappedMessage - decode it recursively
          const wrappedMessageBytes = new Uint8Array(marshallableUserObject.bytes);
          const decodedResult = await service.decode(wrappedMessageBytes);
          
          // Check if decode was successful
          if (decodedResult.isRight()) {
            const wrappedMessageData = decodedResult.value;
            decodedValues.push(wrappedMessageData.value);
          } else {
            console.warn('Failed to decode WrappedMessage in SetBucket:', decodedResult.value);
            // Keep the raw bytes as fallback
            decodedValues.push(Array.from(marshallableUserObject.bytes));
          }
        }
      }
    }
    
    console.log(`Decoded SetBucket with ${decodedValues.length} values`);
    
    // Create uniform bucket structure
    const nativeSet = new Set(decodedValues);
    return {
      typeName: 'SetBucket',
      displayValue: `Set(${decodedValues.length}) { ${decodedValues.map(v => JSON.stringify(v)).join(', ')} }`,
      nativeValue: nativeSet
    };
  } catch (error) {
    console.error('Failed to decode SetBucket:', error);
    return null;
  }
};

/**
 * STEP 9a: Stringify JsonBucket for display (optional custom formatting)
 *
 * This function is called by formatForDisplay() and can provide custom formatting.
 * Current implementation:
 * - Returns displayValue if available (default behavior)
 * - Falls back to legacy JSON.stringify for backward compatibility
 *
 * Users can modify this to provide custom formatting using data.nativeValue (JS object).
 */
const stringifyJsonBucket: StringifyFunction = (data) => {
  // If displayValue is available, use it
  if (data.displayValue !== undefined) {
    return data.displayValue;
  }
  
  // Legacy support: if value is already parsed JSON object
  if (data.typeId === 6104 && typeof data.value === 'object' && data.value !== null) {
    return JSON.stringify(data.value, null, 2);
  }
  
  return null;
};

/**
 * STEP 9b: Stringify SetBucket for display (optional custom formatting)
 *
 * This function is called by formatForDisplay() and can provide custom formatting.
 * Current implementation:
 * - Returns displayValue if available (default behavior)
 * - Falls back to showing metadata structure
 *
 * Users can modify this to provide custom formatting using data.nativeValue (JS Set).
 * Example: Array.from(data.nativeValue).map(item => `• ${item}`).join('\n')
 */
const stringifySetBucket: StringifyFunction = (data) => {
  // If displayValue is available, use it
  if (data.displayValue !== undefined) {
    return data.displayValue;
  }
  
  // Fallback: show metadata
  return JSON.stringify({
    _type: 'WrappedMessage',
    _wrappedType: data.typeName,
    _typeId: data.typeId,
    _note: 'Nested protobuf message',
    _data: data.value
  }, null, 2);
};

/**
 * STEP 6: TYPE_ID_MAP - Central registry for protobuf message types
 *
 * Maps numeric TypeId (from WrappedMessage.wrappedTypeId) to:
 * - file: Proto file containing the message definition
 * - type: Full protobuf message type name
 * - decode: Optional function to decode and transform the message (returns BucketData)
 * - stringify: Optional function to format the decoded data for display
 *
 * When a WrappedMessage contains a nested message with a typeId:
 * 1. Look up typeId in this map
 * 2. Load the proto file
 * 3. Decode the bytes using the message type
 * 4. If decode function exists, call it to transform the data
 * 5. If stringify function exists, use it for custom formatting
 *
 * To add a new type:
 * 1. Add entry with typeId, file, and type
 * 2. Optionally add decode function (if special handling needed)
 * 3. Optionally add stringify function (if custom formatting needed)
 */
const TYPE_ID_MAP: Record<number, { file: string; type: string; decode?: DecodeFunction; stringify?: StringifyFunction }> = {
  // RESP types from global.resp.proto
  6104: {
    file: 'global.resp.proto',
    type: 'org.infinispan.global.resp.JsonBucket',
    decode: decodeJsonBucket,
    stringify: stringifyJsonBucket
  },
  // Multimap types from persistence.multimap.proto
  5305: {
    file: 'persistence.multimap.proto',
    type: 'org.infinispan.persistence.multimap.SetBucket',
    decode: decodeSetBucket,
    stringify: stringifySetBucket
  }
  
  // To add more multimap types, uncomment and add as needed:
  // 5300: { file: 'persistence.multimap.proto', type: 'org.infinispan.persistence.multimap.Bucket' },
  // 5302: { file: 'persistence.multimap.proto', type: 'org.infinispan.persistence.multimap.ListBucket' },
  // 5303: { file: 'persistence.multimap.proto', type: 'org.infinispan.persistence.multimap.HashMapBucket' },
  // 5306: { file: 'persistence.multimap.proto', type: 'org.infinispan.persistence.multimap.MultimapObjectWrapper' },
  // 5307: { file: 'persistence.multimap.proto', type: 'org.infinispan.persistence.multimap.SortedSetBucket' },
  // 5308: { file: 'persistence.multimap.proto', type: 'org.infinispan.persistence.multimap.ScoredValue' }
};

/**
 * Service to decode WrappedMessage protobuf bytes
 * Loads schema from .proto file at runtime
 */
export class WrappedMessageService {
  private static wrappedMessageType: protobuf.Type | null = null;
  private static initialized = false;
  private static initPromise: Promise<void> | null = null;
  private static loadedProtoFiles: Map<string, protobuf.Root> = new Map();

  /**
   * Initialize by loading the .proto file
   */
  public static async init(): Promise<void> {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    // Already initialized
    if (this.initialized) {
      return Promise.resolve();
    }

    // Create initialization promise
    this.initPromise = (async () => {
      try {
        // Load the .proto file (path relative to publicPath /console/)
        const root = await protobuf.load('/console/proto/message-wrapping.proto');
        
        // Lookup the WrappedMessage type
        this.wrappedMessageType = root.lookupType('org.infinispan.protostream.WrappedMessage');
        
        this.initialized = true;
        console.log('WrappedMessage decoder initialized successfully');
      } catch (error) {
        console.error('Failed to initialize WrappedMessage decoder:', error);
        this.initPromise = null; // Allow retry
        throw error;
      }
    })();

    return this.initPromise;
  }

  /**
   * Load a proto file if not already loaded
   * Uses a custom resolvePath to handle imports
   */
  private static async loadProtoFile(fileName: string): Promise<protobuf.Root> {
    if (this.loadedProtoFiles.has(fileName)) {
      console.log(`Using cached proto file: ${fileName}`);
      return this.loadedProtoFiles.get(fileName)!;
    }

    const protoUrl = `/console/proto/${fileName}`;
    console.log(`Attempting to load proto file from: ${protoUrl}`);
    
    try {
      // Create a root with custom path resolution
      const root = new protobuf.Root();
      
      // Override resolvePath to handle imports
      root.resolvePath = (origin: string, target: string) => {
        console.log(`Resolving import: origin=${origin}, target=${target}`);
        
        // If target is already an absolute URL, use it
        if (target.startsWith('http') || target.startsWith('/')) {
          return target;
        }
        
        // For relative imports, resolve to our proto directory
        // Remove any path components from target (e.g., "org/infinispan/..." -> just the filename)
        const targetFileName = target.split('/').pop() || target;
        const resolvedPath = `/console/proto/${targetFileName}`;
        console.log(`Resolved to: ${resolvedPath}`);
        return resolvedPath;
      };
      
      // Load the proto file
      await root.load(protoUrl, { keepCase: true });
      
      this.loadedProtoFiles.set(fileName, root);
      console.log(`Successfully loaded proto file: ${fileName}`);
      return root;
    } catch (error) {
      console.error(`Failed to load proto file ${fileName} from ${protoUrl}:`, error);
      throw error;
    }
  }

  /**
   * Decode bytes using a specific message type identified by typeId
   */
  private static async decodeByTypeId(bytes: Uint8Array, typeId: number): Promise<any> {
    const typeInfo = TYPE_ID_MAP[typeId];
    
    if (!typeInfo) {
      console.warn(`Unknown typeId: ${typeId}, cannot decode`);
      return null;
    }

    try {
      // Load the proto file if needed
      const root = await this.loadProtoFile(typeInfo.file);
      
      // Lookup the message type
      const messageType = root.lookupType(typeInfo.type);
      
      // Decode the bytes
      const message = messageType.decode(bytes);
      
      // Convert to plain object
      const obj = messageType.toObject(message, {
        longs: String,
        bytes: Array,
        defaults: false,
        arrays: true,
        objects: true
      });

      // Special handling for specific message types - use decode function from TYPE_ID_MAP
      if (typeInfo.decode) {
        const result = await typeInfo.decode(bytes, obj, typeId, this);
        if (result) {
          return { ...result, message: obj };
        }
      }

      console.log(`Decoded typeId ${typeId} (${typeInfo.type}):`, obj);
      return obj;
    } catch (error) {
      console.error(`Failed to decode typeId ${typeId}:`, error);
      return null;
    }
  }

  /**
   * Decode WrappedMessage from protobuf bytes
   */
  public static async decode(bytes: Uint8Array): Promise<Either<ActionResponse, WrappedMessageData>> {
    if (!this.initialized || !this.wrappedMessageType) {
      return left({
        message: 'WrappedMessage decoder not initialized. Call init() first.',
        success: false
      });
    }

    try {
      // Decode using the loaded .proto schema
      const message = this.wrappedMessageType.decode(bytes);
      
      // Convert to plain object
      const obj = this.wrappedMessageType.toObject(message, {
        longs: String,      // Convert long to string
        bytes: Array,       // Keep bytes as Uint8Array (converted to regular array)
        defaults: false,    // Don't include default values
        arrays: true,
        objects: true
      });

      // Debug logging
      console.log('=== WrappedMessage Decode Debug ===');
      console.log('Decoded object:', obj);
      console.log('Object keys:', Object.keys(obj));
      console.log('scalarOrMessage field:', obj.scalarOrMessage);
      console.log('===================================');

      // Extract the meaningful data (now async)
      const wrappedData = await this.extractWrappedData(obj);
      return right(wrappedData);
    } catch (error) {
      return left({
        message: `Failed to decode WrappedMessage: ${error}`,
        success: false
      });
    }
  }

  /**
   * Extract the actual data from decoded WrappedMessage
   * This is custom business logic that interprets the protobuf structure
   */
  private static async extractWrappedData(obj: any): Promise<WrappedMessageData> {
    // The oneof field name might be in 'scalarOrMessage' property,
    // but if not, we need to detect which field is actually set
    let oneofField = obj.scalarOrMessage;
    
    // If scalarOrMessage is not set, find which field is actually present
    if (!oneofField) {
      const possibleFields = [
        'wrappedString', 'wrappedInt32', 'wrappedInt64', 'wrappedUInt32', 'wrappedUInt64',
        'wrappedSInt32', 'wrappedSInt64', 'wrappedFixed32', 'wrappedFixed64',
        'wrappedSFixed32', 'wrappedSFixed64', 'wrappedDouble', 'wrappedFloat',
        'wrappedBool', 'wrappedBytes', 'wrappedChar', 'wrappedShort', 'wrappedByte',
        'wrappedDateMillis', 'wrappedInstantSeconds', 'wrappedEnum', 'wrappedMessage',
        'wrappedEmpty'
      ];
      
      for (const field of possibleFields) {
        if (obj[field] !== undefined && obj[field] !== null) {
          oneofField = field;
          console.log('Detected oneof field:', field, 'with value:', obj[field]);
          break;
        }
      }
    }
    
    if (!oneofField) {
      console.warn('No oneof field detected in WrappedMessage object:', obj);
      return {
        type: 'empty',
        value: null
      };
    }

    // Handle wrappedMessage (field 17) - nested protobuf message
    if (oneofField === 'wrappedMessage' && obj.wrappedMessage) {
      const typeName = obj.wrappedTypeName ||
                      (obj.wrappedTypeId !== undefined ? `TypeId:${obj.wrappedTypeId}` : 'Unknown');
      
      // If we have a typeId, try to decode the nested message
      if (obj.wrappedTypeId !== undefined && Array.isArray(obj.wrappedMessage)) {
        const nestedBytes = new Uint8Array(obj.wrappedMessage);
        const decodedNested = await this.decodeByTypeId(nestedBytes, obj.wrappedTypeId);
        
        // If the decoded nested message is a uniform bucket structure, enhance it with WrappedMessage fields
        if (decodedNested && decodedNested.typeName && decodedNested.displayValue !== undefined && decodedNested.nativeValue !== undefined) {
          // Return enhanced bucket structure with all fields
          return {
            type: 'message',
            value: decodedNested,           // Contains: typeName, displayValue, nativeValue, message
            typeName: decodedNested.typeName,  // Bucket type name (e.g., "SetBucket")
            rawBytes: obj.wrappedMessage,
            typeId: obj.wrappedTypeId,
            // Expose displayValue and nativeValue at top level for stringify functions
            displayValue: decodedNested.displayValue,
            nativeValue: decodedNested.nativeValue
          };
        }
        
        // Otherwise, wrap it in a message structure
        return {
          type: 'message',
          value: decodedNested || obj.wrappedMessage,  // Use decoded value or fallback to bytes
          typeName: typeName,
          rawBytes: obj.wrappedMessage,
          typeId: obj.wrappedTypeId
        };
      }
      
      // No typeId, keep as byte array
      return {
        type: 'message',
        value: obj.wrappedMessage,  // Array of bytes
        typeName: typeName,
        rawBytes: obj.wrappedMessage
      };
    }

    // Handle scalar types
    const scalarHandlers: Record<string, () => WrappedMessageData> = {
      wrappedString: () => ({ type: 'string', value: obj.wrappedString }),
      wrappedInt32: () => ({ type: 'int32', value: obj.wrappedInt32 }),
      wrappedInt64: () => ({ type: 'int64', value: obj.wrappedInt64 }),
      wrappedUInt32: () => ({ type: 'uint32', value: obj.wrappedUInt32 }),
      wrappedUInt64: () => ({ type: 'uint64', value: obj.wrappedUInt64 }),
      wrappedSInt32: () => ({ type: 'sint32', value: obj.wrappedSInt32 }),
      wrappedSInt64: () => ({ type: 'sint64', value: obj.wrappedSInt64 }),
      wrappedFixed32: () => ({ type: 'fixed32', value: obj.wrappedFixed32 }),
      wrappedFixed64: () => ({ type: 'fixed64', value: obj.wrappedFixed64 }),
      wrappedSFixed32: () => ({ type: 'sfixed32', value: obj.wrappedSFixed32 }),
      wrappedSFixed64: () => ({ type: 'sfixed64', value: obj.wrappedSFixed64 }),
      wrappedDouble: () => ({ type: 'double', value: obj.wrappedDouble }),
      wrappedFloat: () => ({ type: 'float', value: obj.wrappedFloat }),
      wrappedBool: () => ({ type: 'bool', value: obj.wrappedBool }),
      wrappedBytes: () => ({ type: 'bytes', value: obj.wrappedBytes }),
      wrappedChar: () => ({ type: 'char', value: String.fromCharCode(obj.wrappedChar) }),
      wrappedShort: () => ({ type: 'short', value: obj.wrappedShort }),
      wrappedByte: () => ({ type: 'byte', value: obj.wrappedByte }),
      wrappedDateMillis: () => ({ 
        type: 'date', 
        value: new Date(parseInt(obj.wrappedDateMillis)).toISOString() 
      }),
      wrappedInstantSeconds: () => ({
        type: 'instant',
        value: new Date(parseInt(obj.wrappedInstantSeconds) * 1000).toISOString(),
        nanos: obj.wrappedInstantNanos
      }),
      wrappedEnum: () => ({
        type: 'enum',
        value: obj.wrappedEnum,
        typeName: obj.wrappedTypeName || `TypeId:${obj.wrappedTypeId}`
      }),
      wrappedEmpty: () => ({ type: 'empty', value: null })
    };

    const handler = scalarHandlers[oneofField];
    if (handler) {
      return handler();
    }

    return {
      type: 'unknown',
      value: obj[oneofField],
      raw: obj
    };
  }

  /**
   * Format WrappedMessage data for display in UI
   */
  public static formatForDisplay(data: WrappedMessageData): string {
    // Try to use type-specific stringify function from TYPE_ID_MAP first
    // This allows custom formatting to override default displayValue
    if (data.typeId !== undefined) {
      const typeInfo = TYPE_ID_MAP[data.typeId];
      if (typeInfo?.stringify) {
        const result = typeInfo.stringify(data);
        if (result !== null) {
          return result;
        }
      }
    }
    
    // Fallback: use displayValue if available
    if (data.displayValue !== undefined) {
      return data.displayValue;
    }
    
    // Fallback handling for message types
    if (data.type === 'message') {
      return JSON.stringify({
        _type: 'WrappedMessage',
        _wrappedType: data.typeName,
        _typeId: data.typeId,
        _note: 'Nested protobuf message',
        _data: data.value
      }, null, 2);
    }

    // Fallback handling for enum types
    if (data.type === 'enum') {
      return JSON.stringify({
        _type: 'WrappedEnum',
        _enumType: data.typeName,
        _value: data.value
      }, null, 2);
    }

    // For scalars, just return the value
    return String(data.value);
  }

  /**
   * Check if bytes look like a WrappedMessage
   */
  public static isWrappedMessage(bytes: Uint8Array): boolean {
    if (!this.initialized || !this.wrappedMessageType) {
      return false;
    }

    try {
      this.wrappedMessageType.decode(bytes);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Extracted WrappedMessage data
 */
export interface WrappedMessageData {
  type: string;           // 'message', 'string', 'int32', etc.
  value: any;             // The actual value (for bucket types: contains typeName, displayValue, nativeValue, message)
  typeName?: string;      // For message/enum types or bucket types
  rawBytes?: any;         // Raw bytes array for wrappedMessage
  needsDecoding?: boolean; // Flag indicating nested message needs decoding
  nanos?: number;         // For instant type
  raw?: any;              // Raw decoded object for debugging
  typeId?: number;        // TypeId for nested messages
  
  // Legacy fields: kept for backward compatibility with stringify functions
  // For bucket types, these are also accessible via value.displayValue and value.nativeValue
  displayValue?: string;  // Human-readable representation
  nativeValue?: any;      // JS native: JSON object, Set, Map, Array, etc.
}

// Made with Bob
