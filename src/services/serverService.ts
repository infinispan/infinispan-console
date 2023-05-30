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
   * Get latest server version
   */
  public async getLatestVersion(): Promise<Either<ActionResponse, string>> {
    return this.utils.get('https://api.github.com/repos/infinispan/infinispan/releases/latest', (data) => data.name);
  }
}
