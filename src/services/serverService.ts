import { Either, left, right } from './either';
import { RestUtils } from '@services/restUtils';

/**
 * Infinispan Server related API endpoints
 *
 * @author Katia Aresti
 */
export class ServerService {
  endpoint: string;
  utils: RestUtils;

  constructor(endpoint: string, restUtils: RestUtils) {
    this.endpoint = endpoint;
    this.utils = restUtils;
  }

  /**
   * Get server version or an error
   */
  public async getVersion(): Promise<Either<string, string>> {
    return this.utils
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
