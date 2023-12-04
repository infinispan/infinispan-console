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

  public static init(configOptions: Keycloak.KeycloakConfig | undefined): Promise<void> {
    if (!configOptions) {
      console.error('Unable to init Keycloak with undefined configOptions');
      return new Promise((resolve, reject) => reject('Unable to init Keycloak with undefined configOptions'));
    } else {
      KeycloakService.keycloakAuth = new Keycloak(configOptions);

      return new Promise((resolve, reject) => {
        KeycloakService.keycloakAuth
          .init({})
          .then(() => {
            KeycloakService.Instance.initialized = true;
            resolve();
          })
          .catch((errorData: KeycloakError) => {
            reject(errorData);
          });
      });
    }
  }

  public isInitialized(): boolean {
    return KeycloakService.Instance.initialized;
  }

  public authenticated(): boolean {
    return KeycloakService.keycloakAuth.authenticated ? KeycloakService.keycloakAuth.authenticated : false;
  }

  public login(options?: KeycloakLoginOptions): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      KeycloakService.keycloakAuth
        .login(options)
        .then(() => {
          resolve(true);
        })
        .catch(() => {
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
    return authServerUrl!.charAt(authServerUrl!.length - 1) === '/' ? authServerUrl : authServerUrl + '/';
  }

  public realm(): string | undefined {
    return KeycloakService.keycloakAuth.realm;
  }

  public getToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (KeycloakService.keycloakAuth.token) {
        KeycloakService.keycloakAuth
          .updateToken(5)
          .then(() => {
            resolve(KeycloakService.keycloakAuth.token as string);
          })
          .catch(() => {
            reject('Failed to refresh token');
          });
      } else {
        reject('Not logged in');
      }
    });
  }
}
