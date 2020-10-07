import utils from './utils';
import { Either, left, right } from './either';

class ServerService {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Get server version or an error
   */
  public async getVersion(): Promise<Either<string, string>> {
    return utils
      .restCall(this.endpoint, 'GET')
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((json) => right(json.version))
      .catch((err) => {
        if (err instanceof TypeError) {
          return left(err.message);
        }
        return err.text().then((errorMessage) => {
          let message = 'Unable to retrieve server version ' + name;
          if (errorMessage.length > 0) {
            message = errorMessage;
          }
          return left(message);
        });
      });
  }
}

const serverService: ServerService = new ServerService(
  utils.endpoint() + '/server'
);

export default serverService;
