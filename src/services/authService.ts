import { Either, left, right } from './either';
import * as DigestFetch from 'digest-fetch';

/**
 * Authentication Service calls Infinispan endpoints related to Authentication
 *
 * @author Katia Aresti
 * @since 1.0
 */
export class AuthenticationService {
  endpoint: string;
  private username = '';
  private devMode = false;
  private notSecured = false;
  private authenticatedClient;

  constructor(endpoint: string, devMode: boolean) {
    this.endpoint = endpoint;
    this.devMode = devMode;
    if (devMode && process.env.SKIP_AUTH) {
      this.username = process.env.INFINISPAN_USER
        ? process.env.INFINISPAN_USER
        : 'admin';
      const password = process.env.INFINISPAN_PASSWORD
        ? process.env.INFINISPAN_PASSWORD
        : 'pass';
      this.authenticatedClient = new DigestFetch(this.username, password);
    }
  }

  public isNotSecured() : boolean {
    return this.notSecured;
  }

  public getAuthenticatedClient(): DigestFetch {
    return this.authenticatedClient;
  }

  /**
   * Retrieve the http login endpoint
   */
  public httpLoginUrl(): string {
    return this.endpoint;
  }

  public getUserName(): string {
    return this.username;
  }

  public isLoggedIn(): boolean {
    return this.username != '' && this.authenticatedClient != undefined;
  }

  public logOut() {
    this.username = '';
  }

  public noSecurityMode() {
    this.notSecured = true;
  }

  /**
   * Retrieve AuthInfo
   */
  public async config(): Promise<Either<ActionResponse, AuthInfo>> {
    return fetch(this.endpoint + '?action=config', {
      method: 'GET',
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((json) => {
        const authInfo = <AuthInfo>{
          mode: json.mode,
          ready: json.ready == 'true',
          digest: json.DIGEST == 'true',
        };

        if (authInfo.mode == 'OIDC') {
          authInfo.keycloakConfig = <Keycloak.KeycloakConfig>{
            url: json.url,
            realm: json.realm,
            clientId: json.clientId,
          };
        }

        return right(authInfo) as Either<ActionResponse, AuthInfo>;
      })
      .catch((err) => {
        let actionResponse;
        if (err instanceof TypeError) {
          let errorMessage = err.message;
          if (errorMessage == 'Failed to fetch') {
            errorMessage = 'Unable to connect to the server';
          }
          actionResponse = <ActionResponse>{
            message: errorMessage,
            success: false,
          };
        } else if (err instanceof Response) {
          actionResponse = err
            .text()
            .then(
              (errorMessage) =>
                <ActionResponse>{ message: errorMessage, success: false }
            );
        } else {
          actionResponse = <ActionResponse>{
            message: 'Server Error',
            success: false,
          };
        }
        return left(actionResponse);
      });
  }

  public login(username: string, password: string): Promise<ActionResponse> {
    const client = new DigestFetch(username, password);
    return client
      .fetch(this.endpoint)
      .then((response) => {
        if (response.ok) {
          this.authenticatedClient = client;
          this.username = username;
          return <ActionResponse>{
            success: true,
            message: username + ' logged in',
          };
        }
        if (response.status == 401) {
          return <ActionResponse>{
            success: false,
            message: username + ' not authorized',
          };
        }

        throw response;
      })
      .catch((err) => {
        console.error(err);
        username = '';
        password = '';
        return <ActionResponse>{
          success: false,
          message: 'Unexpected error. Check the logs',
        };
      });
  }
}
