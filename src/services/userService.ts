import {Either, right} from './either';
import {RestUtils} from "@services/utils";
import {AuthenticationService} from "@services/authService";

export enum ACL {
  LIFECYCLE = 'LIFECYCLE',
  READ = 'READ',
  WRITE = 'WRITE',
  EXEC = 'EXEC',
  LISTEN = 'LISTEN',
  BULK_READ = 'BULK_READ',
  BULK_WRITE = 'BULK_WRITE',
  ADMIN = 'ADMIN',
  ALL = 'ALL',
  ALL_READ = 'ALL_READ',
  ALL_WRITE = 'ALL_WRITE',
  NONE = 'NONE',
}


/**
 * User dedicated Services calls Infinispan endpoints related to uusers
 *
 * @author Katia Aresti
 */
export class UserService {
  endpoint: string;
  utils: RestUtils;
  authenticationService: AuthenticationService;

  constructor(endpoint: string, restUtils: RestUtils, authenticationService: AuthenticationService) {
    this.endpoint = endpoint;
    this.utils = restUtils;
    this.authenticationService = authenticationService;
  }

  /**
   * Gets the authorization backups for a cache
   *
   * @param cacheName
   */
  public async userAcl(): Promise<Either<ActionResponse, Acl>> {

    const adminAcl = <Acl>{ global:  [ ACL.ALL ], caches: [] }

    if (this.authenticationService.getUserName() == 'admin') {
      return Promise.resolve(right(adminAcl));
    }

    const noneAcl = <Acl>{ global:  [ ACL.NONE ], caches: [] }

    if (this.authenticationService.getUserName() == 'pepe') {
      return Promise.resolve(right(noneAcl));
    }

    const readAcl = <Acl>{ global:  [ ACL.READ ], caches: [] }

    if (this.authenticationService.getUserName() == 'coco') {
      return Promise.resolve(right(readAcl));
    }

    const cacheAcl1 = <CacheAcl> {name: 'allCache', acl: [ACL.ALL]};
    const cacheAcl2 = <CacheAcl> {name: 'readWriteCache', acl: [ACL.READ, ACL.WRITE]};
    const cacheAcl3 = <CacheAcl> {name: 'onlyReadCache', acl: [ACL.READ]};

    const stubbAcl = <Acl>{ global:  [ ACL.READ, ACL.WRITE ], caches: [cacheAcl1, cacheAcl2, cacheAcl3] }

    return Promise.resolve(right(stubbAcl));
  }

  public isConnected(user: ConnectedUser) : boolean {
    return user.name != '' || this.authenticationService.isNotSecured();
  }

  public hasNonePermission(user: ConnectedUser) : boolean {
    if (this.authenticationService.isNotSecured()) {
      return false;
    }

    if(!user.acl) {
      return false;
    }

    const globalAcl = user.acl.global;

    return globalAcl.includes(ACL.NONE);
  }

  public hasGlobalWriteAccess(user: ConnectedUser) : boolean {
    if (this.authenticationService.isNotSecured()) {
      return true;
    }
    if (!user.acl) {
      return false;
    }
    const globalAcl = user.acl.global;

    return globalAcl.includes(ACL.ALL) || globalAcl.includes(ACL.ALL_WRITE) || globalAcl.includes(ACL.WRITE);
  }


  public hasWriteAccessOnCache(cacheName: string, user: ConnectedUser) : boolean {
    if (this.authenticationService.isNotSecured()) {
      return true;
    }
    if(!user.acl) {
      return false;
    }
    const globalAcl = user.acl.global;

    if (globalAcl.includes(ACL.NONE)) {
      return false;
    }

    if(globalAcl.includes(ACL.ALL) || globalAcl.includes(ACL.ALL_WRITE)) {
      return true;
    }

    const cachesAcl = user.acl.caches;
    for (let cacheAcl of cachesAcl) {
      if(cacheAcl.name == cacheName &&
        ( cacheAcl.acl.includes(ACL.ALL) ||
          cacheAcl.acl.includes(ACL.ALL_WRITE) ||
          cacheAcl.acl.includes(ACL.WRITE)
        )) {
        return true;
      }
    }
    return false;
  }
}
