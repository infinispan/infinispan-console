import { FetchCaller } from '@services/fetchCaller';
import { Either, left, right } from './either';
import displayUtils from '@services/displayUtils';

/**
 * Cross Site replication operations
 * @author Katia Aresti
 */
export class CrossSiteReplicationService {
  endpoint: string;
  utils: FetchCaller;

  constructor(endpoint: string, restUtils: FetchCaller) {
    this.endpoint = endpoint;
    this.utils = restUtils;
  }

  /**
   * Gets the XSite backups for a cache
   *
   * @param cacheName
   */
  public async backupsForCache(cacheName: string): Promise<Either<ActionResponse, XSite[]>> {
    return this.utils.get(this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '/x-site/backups', (data) =>
      Object.keys(data).map((siteName) => <XSite>{ name: siteName, status: data[siteName] })
    );
  }

  /**
   * Gets the status for a cache and site
   *
   * @param cacheName
   */
  public async backupsForSite(cacheName: string, siteName: string): Promise<Either<ActionResponse, SiteNode[]>> {
    return this.utils.get(
      this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '/x-site/backups/' + siteName,
      (data) => Object.keys(data).map((nodeName) => <SiteNode>{ name: nodeName, status: data[nodeName] })
    );
  }

  /**
   * Gets the status for a cache and site
   *
   * @param cacheName
   */
  public async stateTransferStatus(cacheName: string): Promise<Either<ActionResponse, StateTransferStatus[]>> {
    return this.utils.get(
      this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '/x-site/backups?action=push-state-status',
      (data) =>
        Object.keys(data).map(
          (siteName) =>
            <StateTransferStatus>{
              site: siteName,
              status: displayUtils.parseStateTransferStatus(data[siteName])
            }
        )
    );
  }

  /**
   * Takes the cache backup offline
   *
   * @param cacheName
   * @param siteName
   */
  public async takeOffline(cacheName: string, siteName: string): Promise<ActionResponse> {
    return this.doActionOnCacheBackupSite(cacheName, siteName, 'take-offline', 'take offline');
  }

  /**
   * Brings the cache backup online
   *
   * @param cacheName
   * @param siteName
   */
  public async bringOnline(cacheName: string, siteName: string): Promise<ActionResponse> {
    return this.doActionOnCacheBackupSite(cacheName, siteName, 'bring-online', 'bring online');
  }

  /**
   * Starts state transfer to the backup site
   *
   * @param cacheName
   * @param siteName
   */
  public async startStateTransfer(cacheName: string, siteName: string): Promise<ActionResponse> {
    return this.doActionOnCacheBackupSite(cacheName, siteName, 'start-push-state', 'state transfer');
  }

  /**
   * Cancels the state transfer to the backup site
   *
   * @param cacheName
   * @param siteName
   */
  public async cancelStateTransfer(cacheName: string, siteName: string): Promise<ActionResponse> {
    return this.doActionOnCacheBackupSite(cacheName, siteName, 'cancel-push-state', 'cancel state transfer');
  }

  /**
   * Clears the state transfer to the backup site
   *
   * @param cacheName
   * @param siteName
   */
  public async clearStateTransferState(cacheName: string, siteName: string): Promise<ActionResponse> {
    return this.doActionOnCacheBackupSite(cacheName, siteName, 'clear-push-state-status', 'clear state transfer state');
  }

  /**
   * Do the requested action
   */
  private async doActionOnCacheBackupSite(
    cacheName: string,
    siteName: string,
    action: string,
    actionLabel: string
  ): Promise<ActionResponse> {
    let url;
    const encodedCacheName = encodeURIComponent(cacheName);
    if (action == 'clear-push-state-status') {
      url = this.endpoint + '/caches/' + encodedCacheName + '/x-site/local?action=' + action;
    } else {
      url = this.endpoint + '/caches/' + encodedCacheName + '/x-site/backups/' + siteName + '?action=' + action;
    }
    return this.utils.post({
      url: url,
      successMessage: `Operation ${actionLabel} on site ${siteName} has started.`,
      errorMessage: `An error happened during the operation ${actionLabel} started on ${siteName}.`
    });
  }
}
