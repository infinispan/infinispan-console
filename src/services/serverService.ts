import { Either, left, right } from './either';
import { FetchCaller } from '@services/fetchCaller';

/**
 * Infinispan Server related API endpoints
 *
 * @author Katia Aresti
 */
export class ServerService {
  endpoint: string;
  utils: FetchCaller;

  constructor(endpoint: string, restUtils: FetchCaller) {
    this.endpoint = endpoint;
    this.utils = restUtils;
  }

  /**
   * Get server version or an error
   */
  public async getVersion(): Promise<Either<ActionResponse, string>> {
    return this.utils.get(this.endpoint, (data) => data.version);
  }

  /**
   * Get server report for a given nodeName
   */
  public async downloadReport(nodeName: string): Promise<Either<ActionResponse, Blob>> {
    return this.utils
      .fetch(this.endpoint + '/report/' + encodeURIComponent(nodeName), 'GET')
      .then((response) => {
        if (response.ok) {
          return response.blob();
        } else {
          return response.text().then((text) => {
            throw text;
          });
        }
      })
      .then((data) => {
        if (data instanceof Blob) {
          return right(data) as Either<ActionResponse, Blob>;
        }
        return left(<ActionResponse>{
          message: 'Unexpected error retreiving data',
          success: false,
          data: data
        });
      });
  }
}
