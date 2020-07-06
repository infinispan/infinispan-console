import utils from './utils';
import { Either, left, right } from './either';

/**
 * Authentication Service calls Infinispan endpoints related to Authentication
 *
 * @author Katia Aresti
 * @since 1.0
 */
class AuthenticationService {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Retrieve the http login endpoint
   */
  public httpLoginUrl(): string {
    return this.endpoint + '?action=login';
  }

  /**
   * Retrieve AuthInfo
   */
  public async config(): Promise<Either<ActionResponse, AuthInfo>> {
    return fetch(this.endpoint + '?action=config', {
      method: 'GET'
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then(json => {
        const authInfo = <AuthInfo>{
          mode: json.mode
        };

        if (authInfo.mode == 'OIDC') {
          authInfo.keycloakConfig = <Keycloak.KeycloakConfig>{
            url: json.url,
            realm: json.realm,
            clientId: json.clientId
          };
        }

        return right(authInfo);
      })
      .catch(err => {
        let actionResponse;
        if (err instanceof TypeError) {
          let errorMessage = err.message;
          if (errorMessage == 'Failed to fetch') {
            errorMessage = 'Unable to connect to the server';
          }
          actionResponse = <ActionResponse>{
            message: errorMessage,
            success: false
          };
        } else if (err instanceof Response) {
          actionResponse = err
            .text()
            .then(
              errorMessage =>
                <ActionResponse>{ message: errorMessage, success: false }
            );
        } else {
          actionResponse = <ActionResponse>{
            message: 'Server Error',
            success: false
          };
        }
        return left(actionResponse);
      });
  }
}

const authenticationService: AuthenticationService = new AuthenticationService(
  utils.endpoint() + '/login'
);

export default authenticationService;
