export interface CacheAcl {
  name: string;
  acl: string[];
}

export interface AclSubject {
  name: string;
  type: string;
}

export interface Acl {
  user: string;
  subjects: AclSubject[];
  global: string[];
  caches: Map<string, CacheAcl>;
}

export interface ConnectedUser {
  name: string;
  acl?: Acl;
}

export interface Role {
  name: string;
  description: string;
  implicit: boolean;
  permissions: string[];
}

export interface Principal {
  name: string;
  roles: string[];
}

export interface Realm {
  name: string;
  users: string[];
}

export interface AuthInfo {
  mode: string;
  ready: boolean;
  digest: boolean;
  keycloakConfig?: Keycloak.KeycloakConfig;
}
