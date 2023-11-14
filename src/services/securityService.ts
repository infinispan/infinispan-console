import { Either } from './either';
import { FetchCaller } from '@services/fetchCaller';
import { AuthenticationService } from '@services/authService';

export enum ConsoleACL {
  MONITOR = 'MONITOR',
  READ = 'READ',
  WRITE = 'WRITE',
  BULK_READ = 'BULK_READ',
  BULK_WRITE = 'BULK_WRITE',
  CREATE = 'CREATE',
  ADMIN = 'ADMIN'
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
  NONE = 'NONE'
}

/**
 * User dedicated Services calls Infinispan endpoints related to security configuration
 *
 * @author Katia Aresti
 */
export class SecurityService {
  endpoint: string;
  fetchCaller: FetchCaller;
  authenticationService: AuthenticationService;

  constructor(endpoint: string, fetchCaller: FetchCaller, authenticationService: AuthenticationService) {
    this.endpoint = endpoint;
    this.fetchCaller = fetchCaller;
    this.authenticationService = authenticationService;
  }

  /**
   * Retrieve connected user acl
   */
  public async userAcl(): Promise<Either<ActionResponse, Acl>> {
    return this.fetchCaller.get(this.endpoint + '/user/acl', (data) => {
      const subjects = data.subject;
      let username = 'Connected User';
      for (const subject of subjects) {
        if (subject['type'] == 'NamePrincipal') {
          username = subject['name'];
        }
      }

      const global = data.global as string[];
      const cachesAcl = new Map();
      for (const cacheName of Object.keys(data.caches)) {
        cachesAcl.set(cacheName, <CacheAcl>{
          name: cacheName,
          acl: data.caches[cacheName].map((aclStr) => aclStr as ACL)
        });
      }

      return <Acl>{
        user: username,
        global: global.map((aclStr) => aclStr as ACL),
        caches: cachesAcl
      };
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
  public hasCacheConsoleACL(consoleACL: ConsoleACL, cacheName: string, user: ConnectedUser) {
    if (this.isNotSecuredAccess()) {
      return true;
    }

    if (this.notExistingCache(cacheName, user)) {
      return false;
    }

    return this.checkConsoleAcl(consoleACL, this.getCacheACL(cacheName, user).acl);
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
        hasAcl = aclList.includes(ACL.ALL_READ) || aclList.includes(ACL.BULK_READ);
        break;
      case ConsoleACL.BULK_WRITE:
        hasAcl = aclList.includes(ACL.ALL_WRITE) || aclList.includes(ACL.BULK_WRITE);
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

  /**
   * Retrieve security roles
   *
   */
  public async getSecurityRolesNames(): Promise<Either<ActionResponse, string[]>> {
    return this.fetchCaller.get(this.endpoint + '/roles', (data) => data);
  }

  /**
   * Retrieve security roles
   *
   */
  public async getSecurityRoles(): Promise<Either<ActionResponse, Role[]>> {
    return this.fetchCaller.get(this.endpoint + '/roles?action=detailed', (data) =>
      Object.keys(data).map(
        (roleName) =>
          <Role>{
            name: roleName,
            description: data[roleName].description,
            permissions: data[roleName].permissions,
            implicit: data[roleName].implicit
          }
      )
    );
  }

  /**
   * Retrieve security roles
   *
   */
  public async describeRole(roleName: string): Promise<Either<ActionResponse, Role>> {
    return this.fetchCaller.get(
      this.endpoint + '/permissions/' + roleName,
      (data) =>
        <Role>{
          name: roleName,
          description: data.description,
          permissions: data.permissions,
          implicit: data.implicit
        }
    );
  }

  /**
   * Created a new role
   * @param roleName
   * @param roleDescription
   * @param permissions
   */
  public async createRole(roleName: string, roleDescription: string, permissions: string[]) {
    const customHeaders = new Headers();
    customHeaders.append('Content-Type', 'json');
    return this.fetchCaller.post({
      url: this.endpoint + '/permissions/' + roleName + '?' + permissions.map((p) => 'permission=' + p).join('&'),
      successMessage: `Role ${roleName} has been created`,
      errorMessage: `Unexpected error creating role ${roleName}`,
      customHeaders: customHeaders,
      body: roleDescription
    });
  }

  /**
   * Removes a role
   * @param roleName
   * @param messageOk
   * @param messageError
   */
  public async deleteRole(roleName: string, messageOk: string, messageError: string) {
    return this.fetchCaller.delete({
      url: this.endpoint + '/permissions/' + roleName,
      successMessage: messageOk,
      errorMessage: messageError
    });
  }

  /**
   * updates an existing role
   *
   * @param roleName
   * @param roleDescription
   * @param permissions
   * @param messageOk
   * @param messageError
   */
  public async updateRole(
    roleName: string,
    roleDescription: string,
    permissions: string[],
    messageOk: string,
    messageError: string
  ) {
    return this.fetchCaller.put({
      url: this.endpoint + '/permissions/' + roleName + '?' + permissions.map((p) => 'permission=' + p).join('&'),
      successMessage: messageOk,
      errorMessage: messageError,
      body: roleDescription
    });
  }

  /**
   * Flush security cache
   * @param messageOk
   * @param messageError
   */
  public async flushCache(messageOk: string, messageError: string) {
    return this.fetchCaller.post({
      url: this.endpoint + '/cache?action=flush',
      successMessage: messageOk,
      errorMessage: messageError
    });
  }

  /**
   * Retrieve security principals
   *
   */
  public async getSecurityPrincipals(): Promise<Either<ActionResponse, Principal[]>> {
    return this.fetchCaller.get(this.endpoint + '/principals?action=detailed', (data) =>
      Object.keys(data).map(
        (principalName) =>
          <Principal>{
            name: principalName,
            roles: data[principalName]
          }
      )
    );
  }

  /**
   * Created a new principal role mapper
   */
  public async grantAccess(principal: string, roles: string[], messageOk: string, messageError: string) {
    const customHeaders = new Headers();
    customHeaders.append('Content-Type', 'json');
    return this.fetchCaller.post({
      url: this.endpoint + '/roles/' + principal + '?action=grant&' + roles.map((p) => 'role=' + p).join('&'),
      successMessage: messageOk,
      errorMessage: messageError,
      customHeaders: customHeaders
    });
  }

  public async grantOrDenyRoles(
    principal: string,
    action: 'grant' | 'deny',
    roles: string[],
    messageOk: string,
    messageError: string
  ) {
    const customHeaders = new Headers();
    customHeaders.append('Content-Type', 'json');
    return this.fetchCaller.put({
      url: this.endpoint + '/roles/' + principal + '?action=' + action + '&' + roles.map((p) => 'role=' + p).join('&'),
      successMessage: messageOk,
      errorMessage: messageError,
      customHeaders: customHeaders
    });
  }

  public async removePrincipal(principal: string, messageOk: string, messageError: string) {
    const customHeaders = new Headers();
    customHeaders.append('Content-Type', 'json');
    return this.fetchCaller.delete({
      url: this.endpoint + '/roles/' + principal + '?action=grant',
      successMessage: messageOk,
      errorMessage: messageError,
      customHeaders: customHeaders
    });
  }

  public async describePrincipal(principalName: string): Promise<Either<ActionResponse, string[]>> {
    return this.fetchCaller.get(this.endpoint + '/roles/' + principalName, (data) => data);
  }
}
