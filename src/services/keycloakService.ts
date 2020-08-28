import Keycloak, {KeycloakError, KeycloakLoginOptions} from 'keycloak-js';

export class KeycloakService {
  private initialized = false;
  public static keycloakAuth;
  private static instance: KeycloakService = new KeycloakService();

  private constructor() {
    this.initialized = false;
  }

  public static get Instance(): KeycloakService {
    return this.instance;
  }

  public static init(
    configOptions: Keycloak.KeycloakConfig | undefined
  ): Promise<void> {
    if (!configOptions) {
      console.error('Unable to init Keycloak with undefined configOptions');
      return new Promise((resolve, reject) =>
        reject('Unable to init Keycloak with undefined configOptions')
      );
    } else {
      KeycloakService.keycloakAuth = Keycloak(configOptions);

      return new Promise((resolve, reject) => {
        KeycloakService.keycloakAuth
          .init()
          .success(() => {
            KeycloakService.Instance.initialized = true;
            resolve();
          })
          .error((errorData: KeycloakError) => {
            reject(errorData);
          });
      });
    }
  }

  public isInitialized(): boolean {
    return KeycloakService.Instance.initialized;
  }

  public authenticated(): boolean {
    return KeycloakService.keycloakAuth.authenticated
      ? KeycloakService.keycloakAuth.authenticated
      : false;
  }

  public login(options?: KeycloakLoginOptions): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      KeycloakService.keycloakAuth
        .login(options)
        .success(() => {
          resolve(true);
        })
        .error(() => {
          reject(false);
        });
    });
  }

  public logout(redirectUri?: string): void {
    KeycloakService.keycloakAuth.logout({ redirectUri: redirectUri });
  }

  public account(): void {
    KeycloakService.keycloakAuth.accountManagement();
  }

  public authServerUrl(): string | undefined {
    const authServerUrl = KeycloakService.keycloakAuth.authServerUrl;
    return authServerUrl!.charAt(authServerUrl!.length - 1) === '/'
      ? authServerUrl
      : authServerUrl + '/';
  }

  public realm(): string | undefined {
    return KeycloakService.keycloakAuth.realm;
  }

  public getToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (KeycloakService.keycloakAuth.token) {
        KeycloakService.keycloakAuth
          .updateToken(5)
          .success(() => {
            resolve(KeycloakService.keycloakAuth.token as string);
          })
          .error(() => {
            reject('Failed to refresh token');
          });
      } else {
        reject('Not logged in');
      }
    });
  }
}
