import { KeycloakService } from '@services/keycloakService';
import { AuthenticationService } from '@services/authService';
import { Either, left, right } from '@services/either';

/**
 * Fetch Caller
 */
export class FetchCaller {
  private authenticationService: AuthenticationService;
  private user: string | undefined;
  private password: string | undefined;

  /**
   * Get REST API Calls
   *
   * @param url
   * @param transformer
   * @param customHeaders
   */
  public get(
    url: string,
    transformer: (data: any) => any,
    customHeaders?: Headers,
    text?: boolean
  ): Promise<Either<any, any>> {
    const promise: Promise<Response> = this.fetch(url, 'GET', customHeaders);
    return promise
      .then((response): Promise<any> => {
        if (response.ok) {
          return text ? response.text() : response.json();
        }
        return response.text().then((text) => {
          throw text;
        });
      })
      .then((data) => {
        return right(transformer(data));
      })
      .catch((err) => left(this.mapError(err, 'Unexpected error retrieving data.')));
  }

  /**
   * Delete REST API Calls
   *
   * @param deleteCall
   */
  public delete(deleteCall: ServiceCall): Promise<ActionResponse> {
    const responsePromise = this.fetch(deleteCall.url, 'DELETE', deleteCall.customHeaders);
    return this.handleCRUDActionResponse(deleteCall.successMessage, deleteCall.errorMessage, responsePromise);
  }

  /**
   * Put REST API calls
   *
   * @param putCall
   */
  public put(putCall: ServiceCall): Promise<ActionResponse> {
    const responsePromise = this.fetch(putCall.url, 'PUT', putCall.customHeaders, putCall.body);
    return this.handleCRUDActionResponse(putCall.successMessage, putCall.errorMessage, responsePromise);
  }

  /**
   * Post REST API calls
   *
   * @param postCall
   */
  public post(postCall: ServiceCall): Promise<ActionResponse> {
    const responsePromise = this.fetch(postCall.url, 'POST', postCall.customHeaders, postCall.body);
    return this.handleCRUDActionResponse(postCall.successMessage, postCall.errorMessage, responsePromise);
  }

  /**
   * HEAD REST API Calls
   *
   * @param url
   */
  public head(headCall: ServiceCall): Promise<ActionResponse> {
    const responsePromise = this.fetch(headCall.url, 'HEAD');
    return this.handleCRUDActionResponse(headCall.successMessage, headCall.errorMessage, responsePromise);
  }

  /**
   * Perform a REST call
   *
   * @param url
   * @param method
   */
  public fetch(url: string, method: string, customHeaders?: Headers, body?: string): Promise<Response> {
    const headers = this.createAuthenticatedHeader();

    if (customHeaders) {
      customHeaders.forEach((v, k) => headers.set(k, v));
    }

    const fetchOptions: RequestInit = {
      method: method,
      headers: headers,
      credentials: 'include'
    };
    if (body && body.length > 0) {
      fetchOptions['body'] = body;
    }
    return fetch(url, fetchOptions);
  }

  constructor(authenticationService: AuthenticationService, user?: string, password?: string) {
    this.authenticationService = authenticationService;
    this.user = user;
    this.password = password;
  }

  private createAuthenticatedHeader = (): Headers => {
    const headers = new Headers();
    if (KeycloakService.Instance.isInitialized()) {
      headers.append('Authorization', 'Bearer ' + localStorage.getItem('react-token'));
    } else if (this.user && this.password) {
      headers.set('Authorization', 'Basic ' + btoa(this.user + ':' + this.password));
    }
    return headers;
  };

  /**
   * Handle a crud op request result
   *
   * @param name of the object
   * @param successMessage
   * @param response
   */
  private async handleCRUDActionResponse(
    successMessage: string,
    errorMessage: string,
    response: Promise<Response>
  ): Promise<ActionResponse> {
    return response
      .then((response): Promise<string> => {
        if (response.ok) {
          return response.text();
        }
        if (response.status == 404) {
          throw 'Not found.';
        }
        if (response.status == 403) {
          throw 'Unauthorized action.';
        }
        if (response.status == 409) {
          throw 'Already exists.';
        }
        return response.text().then((text): string => {
          throw text;
        });
      })
      .then((message) => {
        return <ActionResponse>{
          message: successMessage,
          success: true,
          data: message
        };
      })
      .catch((err) => this.mapError(err, errorMessage));
  }

  public mapError(err: any, errorMessage: string): ActionResponse {
    if (err instanceof TypeError) {
      return <ActionResponse>{
        message: !errorMessage ? err.message : errorMessage,
        success: false
      };
    }

    if (err instanceof Response) {
      if (err.status == 401) {
        return <ActionResponse>{
          message: errorMessage + '\nUnauthorized action. Check your credentials and try again.',
          success: false
        };
      }
    }

    return this.interpret(err as string, errorMessage);
  }

  private interpret(error: any | undefined, errorMessage: string): ActionResponse {
    if (!error) {
      return <ActionResponse>{
        message: errorMessage,
        success: false
      };
    }

    let success = false;
    let message = '';
    const text = JSON.stringify(error);

    if (text.includes("missing type id property '_type'")) {
      message = "You are trying to write a JSON key or value that needs '_type' field in this cache.";
    } else if (text.includes('Unknown type id : 5901')) {
      message = 'caches.entries.read-error-spring-session';
      success = true;
    } else if (text.includes('Unknown type id')) {
      message = 'caches.entries.read-error-unknown-type';
      success = true;
    } else if (text != '') {
      message = errorMessage + '\n' + text;
    } else {
      message = errorMessage;
    }

    return <ActionResponse>{
      message: message,
      success: success
    };
  }
}
