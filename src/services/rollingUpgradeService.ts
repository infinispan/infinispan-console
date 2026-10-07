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
          plain: {
            username: config.username,
            password: config.password
          }
        }
      };
    }
    const body = JSON.stringify({ 'remote-store': remoteStore });
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await this.utils.fetch(
        this.sourceConnectionUrl(cacheName),
        'POST',
        headers,
        body,
        controller.signal
      );
      clearTimeout(timeoutId);
      if (response.ok) {
        return {
          message: `Cache ${cacheName} connected to source cluster.`,
          success: true
        } as ActionResponse;
      }
      const errorText = await response.text();
      return {
        message: `Failed to connect cache ${cacheName} to source cluster. ${errorText}`,
        success: false
      } as ActionResponse;
    } catch (err) {
      clearTimeout(timeoutId);
      const message = controller.signal.aborted
        ? `Connection to source cluster timed out for cache ${cacheName}.`
        : `Failed to connect cache ${cacheName} to source cluster.`;
      return {
        message,
        success: false
      } as ActionResponse;
    }
  }

  public async checkSourceConnection(cacheName: string): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await this.utils.fetch(
        this.sourceConnectionUrl(cacheName),
        'HEAD',
        undefined,
        undefined,
        controller.signal
      );
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      clearTimeout(timeoutId);
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
        const count = parseInt(text.trim(), 10);
        return right(isNaN(count) ? 0 : count);
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
