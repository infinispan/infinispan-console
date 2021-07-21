import { Either, left, right } from '@services/either';
import { FetchCaller } from '@services/fetchCaller';

/**
 * Protobuf schemas manipulation service
 */
export class ProtobufService {
  endpoint: string;
  utils: FetchCaller;

  constructor(endpoint: string, restUtils: FetchCaller) {
    this.endpoint = endpoint;
    this.utils = restUtils;
  }

  /**
   * Create or Update a Proto Schema
   */
  public async createOrUpdateSchema(
    name: string,
    schema: string,
    create: boolean
  ): Promise<ActionResponse> {
    if (create) {
      return this.utils.post({
        url: this.endpoint + '/' + name,
        successMessage: `Schema ${name} created.`,
        errorMessage: `Unexpected error creating schema ${name}`,
        body: schema,
      });
    }

    return this.utils.put({
      url: this.endpoint + '/' + name,
      successMessage: `Schema ${name} updated.`,
      errorMessage: `Unexpected error updating schema ${name}`,
      body: schema,
    });
  }

  /**
   * Delete schema
   */
  public async delete(schemaName: string): Promise<ActionResponse> {
    return this.utils.delete({
      url: this.endpoint,
      successMessage: `Schema ${schemaName} has been deleted.`,
      errorMessage: `Unexpected error happened when deleting schema ${schemaName}.`,
    });
  }

  /**
   * Get schema
   */
  public async getSchema(
    name: string
  ): Promise<Either<ActionResponse, string>> {
    return this.utils.get(
      this.endpoint + '/' + name,
      (data) => data,
      undefined,
      true
    );
  }

  /**
   * Get the list of files and validation response
   */
  public getProtobufSchemas(): Promise<Either<ActionResponse, ProtoSchema[]>> {
    return this.utils.get(this.endpoint, (data) =>
      data
        .map((schema) => {
          let protoError: ProtoError | undefined = undefined;
          if (schema['error'] != null) {
            protoError = <ProtoError>{
              message: schema.error.message,
              cause: schema.error.cause,
            };
          }
          return <ProtoSchema>{
            name: schema.name,
            error: protoError,
          };
        })
        .filter(
          (schema) =>
            schema.name !=
              'org/infinispan/protostream/message-wrapping.proto' &&
            schema.name != 'org/infinispan/query/remote/client/query.proto'
        )
    );
  }

  private handleProtobufRestError(err): Promise<ActionResponse> {
    let actionResponse = <ActionResponse>{
      message: 'Unknown error retrieving protobuf schemas',
      success: false,
    };

    if (err instanceof TypeError) {
      actionResponse = <ActionResponse>{
        message: err.message,
        success: false,
      };
    } else if (err instanceof Response) {
      if (err.status.valueOf() == 403) {
        // Not Found
        actionResponse = <ActionResponse>{
          message: 'Unauthorized access.',
          success: false,
        };
      } else {
        return err.text().then(
          (errorMessage) =>
            <ActionResponse>{
              message: errorMessage == '' ? 'Unknown error.' : errorMessage,
              success: false,
            }
        );
      }
    }
    return Promise.resolve(actionResponse);
  }
}
