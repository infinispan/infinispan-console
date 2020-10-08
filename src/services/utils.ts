/**
 * Utility class
 *
 * @author Katia Aresti
 */
import { KeycloakService } from './keycloakService';

export enum ComponentStatus {
  STOPPING = 'STOPPING',
  RUNNING = 'RUNNING',
  OK = 'OK',
  CANCELLING = 'CANCELLING',
  SENDING = 'SENDING',
  ERROR = 'ERROR',
  INSTANTIATED = 'INSTANTIATED',
  INITIALIZING = 'INITIALIZING',
  FAILED = 'FAILED',
  TERMINATED = 'TERMINATED',
}

export enum ComponentHealth {
  HEALTHY = 'HEALTHY',
  HEALTHY_REBALANCING = 'HEALTHY_REBALANCING',
  DEGRADED = 'DEGRADED',
  FAILED = 'FAILED',
}

export enum CacheType {
  Distributed = 'Distributed',
  Replicated = 'Replicated',
  Local = 'Local',
  Invalidated = 'Invalidated',
  Scattered = 'Scattered',
}

export enum ContentType {
  StringContentType = 'String', //'application/x-java-object;type=java.lang.String'
  JSON = 'Json', //'application/json'
  XML = 'Xml', //'application/xml'
  IntegerContentType = 'Integer', //'application/x-java-object;type=java.lang.Integer'
  DoubleContentType = 'Double', //'application/x-java-object;type=java.lang.Double'
  LongContentType = 'Long', //'application/x-java-object;type=java.lang.Long'
  BooleanContentType = 'Boolean', //'application/x-java-object;type=java.lang.Boolean'
  BytesType = 'Bytes', //'Bytes'
  OctetStream = 'Base64', //'application/octet-stream'
  OctetStreamHex = 'Hex', //'application/octet-stream; encoding=hex'
}

export enum Flags {
  CACHE_MODE_LOCAL = 'CACHE_MODE_LOCAL',
  FAIL_SILENTLY = 'FAIL_SILENTLY',
  FORCE_ASYNCHRONOUS = 'FORCE_ASYNCHRONOUS',
  FORCE_SYNCHRONOUS = 'FORCE_SYNCHRONOUS',
  FORCE_WRITE_LOCK = 'FORCE_WRITE_LOCK',
  IGNORE_RETURN_VALUES = 'IGNORE_RETURN_VALUES',
  IGNORE_TRANSACTION = 'IGNORE_TRANSACTION',
  PUT_FOR_EXTERNAL_READ = 'PUT_FOR_EXTERNAL_READ',
  REMOTE_ITERATION = 'REMOTE_ITERATION',
  SKIP_CACHE_LOAD = 'SKIP_CACHE_LOAD',
  SKIP_CACHE_STORE = 'SKIP_CACHE_STORE',
  SKIP_INDEX_CLEANUP = 'SKIP_INDEX_CLEANUP',
  SKIP_INDEXING = 'SKIP_INDEXING',
  SKIP_LISTENER_NOTIFICATION = 'SKIP_LISTENER_NOTIFICATION',
  SKIP_LOCKING = 'SKIP_LOCKING',
  SKIP_OWNERSHIP_CHECK = 'SKIP_OWNERSHIP_CHECK',
  SKIP_REMOTE_LOOKUP = 'SKIP_REMOTE_LOOKUP',
  SKIP_SHARED_CACHE_STORE = 'SKIP_SHARED_CACHE_STORE',
  SKIP_SIZE_OPTIMIZATION = 'SKIP_SIZE_OPTIMIZATION',
  SKIP_STATISTICS = 'SKIP_STATISTICS',
  SKIP_XSITE_BACKUP = 'SKIP_XSITE_BACKUP',
  ZERO_LOCK_ACQUISITION_TIMEOUT = 'ZERO_LOCK_ACQUISITION_TIMEOUT',
}

class Utils {
  public isDevMode(): boolean {
    return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  }

  /**
   * Decide the endpoint depending if we are in dev mode or production mode
   */
  public endpoint(): string {
    if (this.isDevMode()) {
      return 'http://localhost:11222/rest/v2';
    } else {
      return window.location.origin.toString() + '/rest/v2';
    }
  }

  public landing(): string {
    if (this.isDevMode()) {
      return 'http://localhost:9000/console/';
    } else {
      return window.location.origin.toString() + '/console';
    }
  }

  public isWelcomePage(): boolean {
    return (
      location.pathname == '/console/welcome' ||
      location.pathname == '/console/welcome/'
    );
  }

  /**
   * Perform a REST call with body
   *
   * @param url
   * @param method
   * @param body
   * @param contentType
   */
  public restCallWithBody(
    url: string,
    method: string,
    body: string,
    contentType?: string
  ): Promise<Response> {
    let headers = this.createAuthenticatedHeader();
    if (contentType) {
      headers.append('Content-Type', contentType);
    }
    return fetch(url, {
      method: method,
      headers: headers,
      credentials: 'include',
      body: body,
    });
  }

  /**
   * Perform a REST call
   *
   * @param url
   * @param method
   */
  public restCall(
    url: string,
    method: string,
    accept?: string
  ): Promise<Response> {
    let headers = this.createAuthenticatedHeader();
    if (accept && accept.length > 0) {
      headers.append('Accept', accept);
    }
    return fetch(url, {
      method: method,
      credentials: 'include',
      headers: headers,
    });
  }

  public createAuthenticatedHeader = (): Headers => {
    let headers = new Headers();
    if (KeycloakService.Instance.isInitialized()) {
      headers.append(
        'Authorization',
        'Bearer ' + localStorage.getItem('react-token')
      );
    }
    return headers;
  };

  public isJSONObject(value: string): boolean {
    try {
      let jsonObj = JSON.parse(value);
      return jsonObj['_type'];
    } catch (err) {
      return false;
    }
  }

  /**
   * Handle a crud op request result
   *
   * @param name of the object
   * @param successMessage
   * @param response
   */
  public async handleCRUDActionResponse(
    successMessage: string,
    response: Promise<Response>
  ): Promise<ActionResponse> {
    return response
      .then((response) => {
        if (response.ok) {
          return response.text();
        }
        throw response;
      })
      .then((text) => {
        return <ActionResponse>{
          message: text == '' ? successMessage : text,
          success: true,
        };
      })
      .catch((err) => {
        if (err instanceof TypeError) {
          return <ActionResponse>{ message: err.message, success: false };
        }

        return err
          .text()
          .then(
            (errorMessage) =>
              <ActionResponse>{ message: errorMessage, success: false }
          );
      });
  }

  public mapError(err: any, errorMessage?: string): ActionResponse {
    console.error(err);
    if (err instanceof TypeError) {
      return <ActionResponse>{
        message: !errorMessage ? err.message : errorMessage,
        success: false,
      };
    }

    return err.text().then(
      (text) =>
        <ActionResponse>{
          message: !errorMessage ? text : errorMessage,
          success: false,
        }
    );
  }

  /**
   * Calculate the key content type header value to send ot the REST API
   * @param contentType
   */
  public fromContentType(contentType: ContentType): string {
    let stringContentType = '';
    switch (contentType) {
      case ContentType.StringContentType:
      case ContentType.DoubleContentType:
      case ContentType.IntegerContentType:
      case ContentType.LongContentType:
      case ContentType.BooleanContentType:
        stringContentType =
          'application/x-java-object;type=java.lang.' + contentType.toString();
        break;
      case ContentType.OctetStream:
        stringContentType = 'application/octet-stream';
        break;
      case ContentType.OctetStreamHex:
        stringContentType = 'application/octet-stream; encoding=hex';
        break;
      case ContentType.JSON:
        stringContentType = 'application/json';
        break;
      case ContentType.XML:
        stringContentType = 'application/xml';
        break;
      default:
        console.warn('Content type not mapped ' + contentType);
    }

    return stringContentType;
  }

  /**
   * Translate from string to ContentType
   *
   * @param contentTypeHeader
   * @param defaultContentType
   */
  public toContentType(
    contentTypeHeader: string | null | undefined,
    defaultContentType?: ContentType
  ): ContentType {
    if (contentTypeHeader == null) {
      return defaultContentType
        ? defaultContentType
        : ContentType.StringContentType;
    }
    if (
      contentTypeHeader.startsWith('application/x-java-object;type=java.lang.')
    ) {
      const contentType = contentTypeHeader.replace(
        'application/x-java-object;type=java.lang.',
        ''
      );
      return contentType as ContentType;
    }

    if (contentTypeHeader == 'application/octet-stream') {
      return ContentType.OctetStream;
    }

    if (contentTypeHeader == 'application/octet-stream; encoding=hex') {
      return ContentType.OctetStreamHex;
    }

    if (contentTypeHeader == 'application/json') {
      return ContentType.JSON;
    }

    if (contentTypeHeader == 'application/xml') {
      return ContentType.XML;
    }

    return ContentType.StringContentType;
  }
}

const utils: Utils = new Utils();

export default utils;
