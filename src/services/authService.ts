import { Either, left, right } from './either';
import { ConsoleServices } from '@services/ConsoleServices';

/**
 * Authentication Service calls Infinispan endpoints related to Authentication
 *
 * @author Katia Aresti
 * @since 1.0
 */
export class AuthenticationService {
  endpoint: string;
  private username = '';
  private notSecured = false;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public isNotSecured() {
    return this.notSecured;
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
    return this.username != ''; // && this.authenticatedClient != undefined;
  }

  public logOut() {
    return fetch(ConsoleServices.endpoint() + '/server', {
      headers: { Authorization: 'Basic xxx' },
    })
      .then((response) => {
        console.log(response);
        if (response.ok) {
          return <ActionResponse>{
            success: true,
            message: ' logged in',
          };
        }
        if (response.status == 401) {
          return <ActionResponse>{
            success: false,
            message: 'not authorized',
          };
        }

        throw response;
      })
      .catch((err) => {
        console.error(err);
        return <ActionResponse>{
          success: false,
          message: 'Unexpected error. Check the logs',
        };
      });
  }

  public noSecurityMode() {
    this.notSecured = true;
  }

  /**
   * Retrieve AuthInfo
   */
  public async config(): Promise<Either<ActionResponse, AuthInfo>> {
    return fetch(this.endpoint + '/login?action=config', {
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

  // hack to force cleanup of credentials in the browser
  public logOutLink(): Promise<void> {
    let headers = new Headers();
    headers.set(
      'Authorization',
      'Digest username="logout", realm="default", nonce="AAAAUAAAbk7PxogAe0ZbfFS+9jfxOQkSOmsTXWEq/9EmvXSaEWlJp4PGMnU=", uri="/rest/v2/server", algorithm=MD5, response="8af9ceca5a428b0c765c409375964842", opaque="00000000000000000000000000000000", qop=auth, nc=0000005a, cnonce="1b28b45b19a14807"'
    );

    let fetchOptions: RequestInit = {
      headers: headers,
      credentials: 'include',
    };
    return fetch(ConsoleServices.endpoint() + '/server', fetchOptions)
      .then((response) => {})
      .catch((err) => {});
  }

  public loginLink(): Promise<ActionResponse> {
    return fetch(ConsoleServices.endpoint() + '/server', {
      credentials: 'include',
    })
      .then((response) => {
        if (response.ok) {
          return <ActionResponse>{
            success: true,
            message: ' logged in',
          };
        }
        if (response.status == 401) {
          return <ActionResponse>{
            success: false,
            message: 'not authorized',
          };
        }

        throw response;
      })
      .catch((err) => {
        console.error(err);
        return <ActionResponse>{
          success: false,
          message: 'Unexpected error. Check the logs',
        };
      });
  }
}
