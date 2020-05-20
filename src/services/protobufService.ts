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
    return utils
      .restCallWithBody(
        this.endpoint + '/' + name,
        create ? 'POST' : 'PUT',
        schema
      )
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then(schema => {
        let protoError: ProtoError | undefined = undefined;
        if (schema['error'] != null) {
          protoError = <ProtoError>{
            message: schema.error.message,
            cause: schema.error.cause
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
          success: protoError == undefined
        });
      })
      .catch(err => {
        if (err instanceof TypeError) {
          return left(<ActionResponse>{ message: err.message, success: false });
        }

        if (err instanceof Response && err.status == 409) {
          return left(<ActionResponse>{
            message: 'Schema ' + name + ' already exists.',
            success: false
          });
        }

        return err.text().then(errorMessage => {
          let message = 'Unable to create schema ' + name;
          if (errorMessage.length > 0) {
            message = errorMessage;
          }
          return left(<ActionResponse>{ message: message, success: false });
        });
      });
  }

  /**
   * Delete schema
   */
  public async delete(name: string): Promise<ActionResponse> {
    return utils
      .restCallWithBody(this.endpoint + '/' + name, 'DELETE', name)
      .then(response => {
        if (response.ok) {
          return <ActionResponse>{
            message: 'Schema ' + name + ' has been deleted',
            success: true
          };
        }
        throw response;
      })
      .catch(err => {
        let message = 'Un error happened when deleting schema ' + name + '.';

        if (err instanceof TypeError) {
          return <ActionResponse>{
            message: message + ' ' + err.message,
            success: false
          };
        }

        return err.text().then(errorMessage => {
          if (errorMessage.length > 0) {
            message = message + ' ' + errorMessage;
          }
          return <ActionResponse>{ message: message, success: false };
        });
      });
  }

  /**
   * Get schema
   */
  public async getSchema(
    name: string
  ): Promise<Either<ActionResponse, string>> {
    return utils
      .restCall(this.endpoint + '/' + name, 'GET')
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        throw response;
      })
      .then(schema => right(schema))
      .catch(err => left(<ActionResponse>{ message: err, success: false }));
  }

  /**
   * Get the list of files and validation response
   */
  public getProtobufSchemas(): Promise<Either<ActionResponse, ProtoSchema[]>> {
    return utils
      .restCall(this.endpoint, 'GET')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then(protoSchemas =>
        right(
          protoSchemas.map(schema => {
            let protoError: ProtoError | undefined = undefined;
            if (schema['error'] != null) {
              protoError = <ProtoError>{
                message: schema.error.message,
                cause: schema.error.cause
              };
            }
            return <ProtoSchema>{
              name: schema.name,
              error: protoError
            };
          })
        )
      )
      .catch(err => left(<ActionResponse>{ message: err, success: false }));
  }
}

const protobufService: ProtobufService = new ProtobufService(
  utils.endpoint() + '/schemas'
);

export default protobufService;
