/**
 * Cross Site replication operations
 * @author Katia Aresti
 * @since 1.0
 */
import utils, { KeyContentType, ValueContentType } from './utils';
import { Either, left, right } from './either';
import displayUtils from './displayUtils';

class CrossSiteReplicationService {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Gets the XSite backups for a cache
   *
   * @param cacheName
   */
  public async backupsForCache(
    cacheName: string
  ): Promise<Either<ActionResponse, XSite[]>> {
    return utils
      .restCall(
        this.endpoint +
          '/caches/' +
          encodeURIComponent(cacheName) +
          '/x-site/backups',
        'GET'
      )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((data) =>
        right(
          Object.keys(data).map(
            (siteName) => <XSite>{ name: siteName, status: data[siteName] }
          )
        )
      )
      .catch((err) => {
        if (err instanceof TypeError) {
          return left(<ActionResponse>{ message: err.message, success: false });
        }

        return err.text().then((errorMessage) => {
          if (errorMessage == '') {
            errorMessage =
              'An error happened retrieving backups for cache ' + cacheName;
          }

          return left(<ActionResponse>{
            message: errorMessage,
            success: false,
          });
        });
      });
  }

  /**
   * Gets the status for a cache and site
   *
   * @param cacheName
   */
  public async backupsForSite(
    cacheName: string,
    siteName: string
  ): Promise<Either<ActionResponse, SiteNode[]>> {
    return utils
      .restCall(
        this.endpoint +
          '/caches/' +
          encodeURIComponent(cacheName) +
          '/x-site/backups/' +
          siteName,
        'GET'
      )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((data) =>
        right(
          Object.keys(data).map(
            (nodeName) => <SiteNode>{ name: nodeName, status: data[nodeName] }
          )
        )
      )
      .catch((err) => {
        if (err instanceof TypeError) {
          return left(<ActionResponse>{ message: err.message, success: false });
        }

        return err.text().then((errorMessage) => {
          if (errorMessage == '') {
            errorMessage =
              'An error happened retrieving backups for cache ' +
              cacheName +
              'and site ' +
              siteName;
          }

          return left(<ActionResponse>{
            message: errorMessage,
            success: false,
          });
        });
      });
  }

  /**
   * Gets the status for a cache and site
   *
   * @param cacheName
   */
  public async stateTransferStatus(
    cacheName: string
  ): Promise<Either<ActionResponse, StateTransferStatus[]>> {
    return utils
      .restCall(
        this.endpoint +
          '/caches/' +
          encodeURIComponent(cacheName) +
          '/x-site/backups?action=push-state-status',
        'GET'
      )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((data) =>
        right(
          Object.keys(data).map(
            (siteName) =>
              <StateTransferStatus>{ site: siteName, status: data[siteName] }
          )
        )
      )
      .catch((err) => {
        if (err instanceof TypeError) {
          return left(<ActionResponse>{ message: err.message, success: false });
        }

        return err.text().then((errorMessage) => {
          if (errorMessage == '') {
            errorMessage =
              'An error happened retrieving state transfer status for cache ' +
              cacheName;
          }

          return left(<ActionResponse>{
            message: errorMessage,
            success: false,
          });
        });
      });
  }

  /**
   * Takes the cache backup offline
   *
   * @param cacheName
   * @param siteName
   */
  public async takeOffline(
    cacheName: string,
    siteName: string
  ): Promise<ActionResponse> {
    return this.doActionOnCacheBackupSite(
      cacheName,
      siteName,
      'take-offline',
      'take offline'
    );
  }

  /**
   * Brings the cache backup online
   *
   * @param cacheName
   * @param siteName
   */
  public async bringOnline(
    cacheName: string,
    siteName: string
  ): Promise<ActionResponse> {
    return this.doActionOnCacheBackupSite(
      cacheName,
      siteName,
      'bring-online',
      'bring online'
    );
  }

  /**
   * Starts state transfer to the backup site
   *
   * @param cacheName
   * @param siteName
   */
  public async startStateTransfer(
    cacheName: string,
    siteName: string
  ): Promise<ActionResponse> {
    return this.doActionOnCacheBackupSite(
      cacheName,
      siteName,
      'start-push-state',
      'state transfer'
    );
  }

  /**
   * Cancels the state transfer to the backup site
   *
   * @param cacheName
   * @param siteName
   */
  public async cancelStateTransfer(
    cacheName: string,
    siteName: string
  ): Promise<ActionResponse> {
    return this.doActionOnCacheBackupSite(
      cacheName,
      siteName,
      'cancel-push-state',
      'cancel state transfer'
    );
  }

  /**
   * Clears the state transfer to the backup site
   *
   * @param cacheName
   * @param siteName
   */
  public async clearStateTransferState(
    cacheName: string,
    siteName: string
  ): Promise<ActionResponse> {
    return this.doActionOnCacheBackupSite(
      cacheName,
      siteName,
      'clear-push-state-status',
      'clear state transfer state'
    );
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
      url =
        this.endpoint +
        '/caches/' +
        encodedCacheName +
        '/x-site/local?action=' +
        action;
    } else {
      url =
        this.endpoint +
        '/caches/' +
        encodedCacheName +
        '/x-site/backups/' +
        siteName +
        '?action=' +
        action;
    }
    return utils
      .restCall(url, 'GET')
      .then(response => {
        if (response.ok) {
          return <ActionResponse>{
            message:
              'Operation ' +
              actionLabel +
              ' on site ' +
              siteName +
              ' has started',
            success: true,
          };
        }
        throw response;
      })
      .catch((err) => {
        if (err instanceof TypeError) {
          return <ActionResponse>{ message: err.message, success: false };
        }

        return err.text().then((errorMessage) => {
          if (errorMessage == '') {
            errorMessage =
              'An error happened during the operation ' +
              actionLabel +
              ' started on ' +
              siteName;
          }

          return <ActionResponse>{
            message: errorMessage,
            success: false,
          };
        });
      });
  }
}

const crossSiteReplicationService: CrossSiteReplicationService = new CrossSiteReplicationService(
  utils.endpoint()
);

export default crossSiteReplicationService;
