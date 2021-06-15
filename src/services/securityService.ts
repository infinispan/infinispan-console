import { Either, left, right } from './either';
import { RestUtils } from '@services/restUtils';
import { AuthenticationService } from '@services/authService';

export enum ConsoleACL {
  MONITOR = 'MONITOR',
  READ = 'READ',
  WRITE = 'WRITE',
  BULK_READ = 'BULK_READ',
  BULK_WRITE = 'BULK_WRITE',
  CREATE = 'CREATE',
  ADMIN = 'ADMIN',
}

export enum ACL {
  MONITOR = 'MONITOR',
  LIFECYCLE = 'LIFECYCLE',
  READ = 'READ',
  WRITE = 'WRITE',
  EXEC = 'EXEC',
  LISTEN = 'LISTEN',
  BULK_READ = 'BULK_READ',
  BULK_WRITE = 'BULK_WRITE',
  CREATE = 'CREATE',
  ADMIN = 'ADMIN',
  ALL = 'ALL',
  ALL_READ = 'ALL_READ',
  ALL_WRITE = 'ALL_WRITE',
  NONE = 'NONE',
}

/**
 * User dedicated Services calls Infinispan endpoints related to security configuration
 *
 * @author Katia Aresti
 */
export class SecurityService {
  endpoint: string;
  utils: RestUtils;
  authenticationService: AuthenticationService;

  constructor(
    endpoint: string,
    restUtils: RestUtils,
    authenticationService: AuthenticationService
  ) {
    this.endpoint = endpoint;
    this.utils = restUtils;
    this.authenticationService = authenticationService;
  }

  /**
   * Retrieve connected user acl
   */
  public async userAcl(): Promise<Either<ActionResponse, Acl>> {
    return this.utils
      .restCall(this.endpoint + '/user/acl', 'GET')
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((data) => {
        const subjects = data.subject;
        let username = 'Connected User';
        for (let subject of subjects) {
          if (subject['type'] == 'NamePrincipal') {
            username = subject['name'];
          }
        }

        let global = data.global as string[];
        let cachesAcl = new Map();
        for (let cacheName of Object.keys(data.caches)) {
          cachesAcl.set(cacheName, <CacheAcl>{
            name: cacheName,
            acl: data.caches[cacheName].map((aclStr) => aclStr as ACL),
          });
        }

        return right(<Acl>{
          user: username,
          global: global.map((aclStr) => aclStr as ACL),
          caches: cachesAcl,
        }) as Either<ActionResponse, Acl>;
      })
      .catch((err) => {
        return left(
          this.utils.mapError(
            err,
            'An error happened retrieving acl for ' +
              this.authenticationService.getUserName()
          )
        );
      });
  }

  public isConnected(user: ConnectedUser): boolean {
    return user.name != '' || this.authenticationService.isNotSecured();
  }

  /**
   * Console ACL
   * @param user
   */
  public hasConsoleACL(consoleACL: ConsoleACL, user: ConnectedUser): boolean {
    if (this.authenticationService.isNotSecured()) {
      return true;
    }
    if (!user.acl) {
      return false;
    }
    const globalAcl = user.acl.global;

    return this.checkConsoleAcl(consoleACL, globalAcl);
  }

  /**
   * Console ACL for caches
   * @param user
   */
  public hasCacheConsoleACL(
    consoleACL: ConsoleACL,
    cacheName: string,
    user: ConnectedUser
  ) {
    if (this.isNotSecuredAccess()) {
      return true;
    }

    if (this.notExistingCache(cacheName, user)) {
      return false;
    }

    return this.checkConsoleAcl(
      consoleACL,
      this.getCacheACL(cacheName, user).acl
    );
  }

  private checkConsoleAcl(consoleACL: ConsoleACL, aclList: string[]) {
    let hasAcl = false;

    switch (consoleACL) {
      case ConsoleACL.MONITOR:
        hasAcl = aclList.includes(ACL.MONITOR);
        break;
      case ConsoleACL.ADMIN:
        hasAcl = aclList.includes(ACL.ADMIN);
        break;
      case ConsoleACL.BULK_READ:
        hasAcl =
          aclList.includes(ACL.ALL_READ) || aclList.includes(ACL.BULK_READ);
        break;
      case ConsoleACL.BULK_WRITE:
        hasAcl =
          aclList.includes(ACL.ALL_WRITE) || aclList.includes(ACL.BULK_WRITE);
        break;
      case ConsoleACL.READ:
        hasAcl = aclList.includes(ACL.ALL_READ) || aclList.includes(ACL.READ);
        break;
      case ConsoleACL.WRITE:
        hasAcl = aclList.includes(ACL.ALL_WRITE) || aclList.includes(ACL.WRITE);
        break;
      case ConsoleACL.CREATE:
        hasAcl = aclList.includes(ACL.CREATE);
        break;
    }
    return hasAcl;
  }

  private isNotSecuredAccess(): boolean {
    return this.authenticationService.isNotSecured();
  }

  private getCacheACL(cacheName: string, user: ConnectedUser): CacheAcl {
    return user?.acl?.caches.get(cacheName) as CacheAcl;
  }

  private notExistingCache(cacheName: string, user: ConnectedUser): boolean {
    return !user.acl || !user.acl.caches.has(cacheName);
  }
}
