import Keycloak, { KeycloakError, KeycloakLoginOptions } from 'keycloak-js';

export class KeycloakService {
  private initialized = false;
  public static keycloakAuth: Keycloak;
  private static instance: KeycloakService = new KeycloakService();

  private constructor() {
    this.initialized = false;
  }

  public static get Instance(): KeycloakService {
    return this.instance;
  }

  public init(configOptions: Keycloak.KeycloakConfig | undefined): Promise<boolean> {
    if (!configOptions) {
      console.error('Unable to init Keycloak with undefined configOptions');
      return new Promise((resolve, reject) => reject('Unable to init Keycloak with undefined configOptions'));
    } else {
      KeycloakService.keycloakAuth = new Keycloak(configOptions);
      return KeycloakService.keycloakAuth
        .init()
        .catch((errorData: KeycloakError) => {
          console.error(errorData);
          return false;
        })
        .finally(() => {
          KeycloakService.Instance.initialized = true;
        });
    }
  }

  public isInitialized(): boolean {
    return KeycloakService.Instance.initialized;
  }

  public authenticated(): boolean {
    return KeycloakService.keycloakAuth.authenticated ? KeycloakService.keycloakAuth.authenticated : false;
  }

  public login(options?: KeycloakLoginOptions): Promise<void> {
    return KeycloakService.keycloakAuth.login(options);
  }

  public logout(redirectUri?: string): Promise<void> {
    return KeycloakService.keycloakAuth.logout({ redirectUri: redirectUri });
  }

  public account(): void {
    KeycloakService.keycloakAuth.accountManagement();
  }

  public authServerUrl(): string | undefined {
    const authServerUrl = KeycloakService.keycloakAuth.authServerUrl;
    return authServerUrl!.charAt(authServerUrl!.length - 1) === '/' ? authServerUrl : authServerUrl + '/';
  }

  public realm(): string | undefined {
    return KeycloakService.keycloakAuth.realm;
  }

  public getToken(): Promise<boolean> {
    return KeycloakService.keycloakAuth.updateToken(5);
  }
}
