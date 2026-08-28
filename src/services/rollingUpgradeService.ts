import { FetchCaller } from '@services/fetchCaller';
import { Either, left, right } from './either';

export class RollingUpgradeService {
  endpoint: string;
  utils: FetchCaller;

  constructor(endpoint: string, restUtils: FetchCaller) {
    this.endpoint = endpoint;
    this.utils = restUtils;
  }

  private sourceConnectionUrl(cacheName: string): string {
    return this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '/rolling-upgrade/source-connection';
  }

  private syncDataUrl(cacheName: string): string {
    return this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '/_sync-data';
  }

  public async addSourceConnection(cacheName: string, config: RemoteStoreConfig): Promise<ActionResponse> {
    const remoteStore: any = {
      cache: cacheName,
      shared: true,
      'remote-server': [{ host: config.host, port: config.port }]
    };
    if (config.secured) {
      remoteStore.security = {
        authentication: {
          digest: {
            username: config.username,
            password: config.password,
            realm: config.realm || 'default'
          }
        }
      };
    }
    const body = JSON.stringify({ 'remote-store': remoteStore });
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    return this.utils.post({
      url: this.sourceConnectionUrl(cacheName),
      successMessage: `Cache ${cacheName} connected to source cluster.`,
      errorMessage: `Failed to connect cache ${cacheName} to source cluster.`,
      body: body,
      customHeaders: headers
    });
  }

  public async checkSourceConnection(cacheName: string): Promise<boolean> {
    try {
      const response = await this.utils.fetch(this.sourceConnectionUrl(cacheName), 'HEAD');
      return response.ok;
    } catch {
      return false;
    }
  }

  public async getSourceConnection(cacheName: string): Promise<Either<ActionResponse, any>> {
    return this.utils.get(this.sourceConnectionUrl(cacheName), (data) => data);
  }

  public async deleteSourceConnection(cacheName: string): Promise<ActionResponse> {
    return this.utils.delete({
      url: this.sourceConnectionUrl(cacheName),
      successMessage: `Cache ${cacheName} disconnected from source cluster.`,
      errorMessage: `Failed to disconnect cache ${cacheName} from source cluster.`
    });
  }

  public async syncData(
    cacheName: string,
    readBatch?: number,
    threads?: number
  ): Promise<Either<ActionResponse, number>> {
    let url = this.syncDataUrl(cacheName);
    const params: string[] = [];
    if (readBatch) params.push('read-batch=' + readBatch);
    if (threads) params.push('threads=' + threads);
    if (params.length > 0) url += '?' + params.join('&');

    try {
      const response = await this.utils.fetch(url, 'POST');
      if (response.ok) {
        const text = await response.text();
        const match = text.match(/Synchronized (\d+)/);
        return right(match ? parseInt(match[1], 10) : 0);
      }
      const errorText = await response.text();
      return left(<ActionResponse>{
        message: 'Failed to sync data for cache ' + cacheName + ': ' + errorText,
        success: false
      });
    } catch (err) {
      return left(<ActionResponse>{
        message: 'Failed to sync data for cache ' + cacheName,
        success: false
      });
    }
  }
}
