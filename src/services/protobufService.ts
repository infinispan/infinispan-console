import utils from './utils';
import { Either, left, right } from './either';

/**
 * Protobuf schemas manipulation service
 */
class ProtobufService {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Create or Update a Proto Schema
   */
  public async createOrUpdateSchema(
    name: string,
    schema: string,
    create: boolean
  ): Promise<Either<ActionResponse, ActionResponse>> {
    // @ts-ignore
    return utils
      .restCallWithBody(
        this.endpoint + '/' + name,
        create ? 'POST' : 'PUT',
        schema
      )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((schema) => {
        let protoError: ProtoError | undefined = undefined;
        if (schema['error'] != null) {
          protoError = <ProtoError>{
            message: schema.error.message,
            cause: schema.error.cause,
          };
        }
        let message = 'Schema ' + name;
        if (protoError) {
          message = protoError.message;
        } else if (create) {
          message = message + ' created.';
        } else {
          message = message + ' updated.';
        }

        return right(<ActionResponse>{
          message: message,
          success: protoError == undefined,
        });
      })
      .catch((err) => this.handleProtobufRestError(err).then((r) => left(r)));
  }

  /**
   * Delete schema
   */
  public async delete(name: string): Promise<ActionResponse> {
    return utils
      .restCallWithBody(this.endpoint + '/' + name, 'DELETE', name)
      .then((response) => {
        if (response.ok) {
          return <ActionResponse>{
            message: 'Schema ' + name + ' has been deleted',
            success: true,
          };
        }
        throw response;
      })
      .catch((err) => this.handleProtobufRestError(err));
  }

  /**
   * Get schema
   */
  public async getSchema(
    name: string
  ): Promise<Either<ActionResponse, string>> {
    // @ts-ignore
    return utils
      .restCall(this.endpoint + '/' + name, 'GET')
      .then((response) => {
        if (response.ok) {
          return response.text();
        }
        throw response;
      })
      .then((schema) => right(schema))
      .catch((err) => this.handleProtobufRestError(err).then((r) => left(r)));
  }

  /**
   * Get the list of files and validation response
   */
  public getProtobufSchemas(): Promise<Either<ActionResponse, ProtoSchema[]>> {
    // @ts-ignore
    return utils
      .restCall(this.endpoint, 'GET')
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((protoSchemas) =>
        right(
          protoSchemas
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
        )
      )
      .catch((err) => this.handleProtobufRestError(err).then((r) => left(r)));
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
          message:
            'Unauthorized access.',
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

const protobufService: ProtobufService = new ProtobufService(
  utils.endpoint() + '/schemas'
);

export default protobufService;
