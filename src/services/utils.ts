/**
 * Utility class
 *
 * @author Katia Aresti
 */
import { SelectOptionObject } from '@patternfly/react-core/src/components/Select/SelectOption';
import { KeycloakService } from './keycloakService';

export enum KeyContentType {
  OctetStream = 'application/octet-stream',
  OctetStreamHex = 'application/octet-stream; encoding=hex',
  StringContentType = 'java.lang.String',
  DoubleContentType = 'java.lang.Double',
  IntegerContentType = 'java.lang.Integer',
  LongContentType = 'java.lang.Long',
  BooleanContentType = 'java.lang.Boolean',
  BytesType = 'Bytes'
}

export enum ValueContentType {
  JSON = 'application/json',
  XML = 'application/xml',
  TEXT = 'text/plain'
}

export enum Flags {
  CACHE_MODE_LOCAL = 'CACHE_MODE_LOCAL',
  FAIL_SILENTLY = 'FAIL_SILENTLY',
  FORCE_ASYNCHRONOUS = 'FORCE_ASYNCHRONOUS',
  FORCE_SYNCHRONOUS = 'FORCE_SYNCHRONOUS',
  FORCE_WRITE_LOCK = 'FORCE_WRITE_LOCK',
  IGNORE_RETURN_VALUES = 'IGNORE_RETURN_VALUES',
  IGNORE_TRANSACTION = 'IGNORE_TRANSACTION',
  PUT_FOR_EXTERNAL_READ = 'PUT_FOR_EXTERNAL_READ',
  REMOTE_ITERATION = 'REMOTE_ITERATION',
  SKIP_CACHE_LOAD = 'SKIP_CACHE_LOAD',
  SKIP_CACHE_STORE = 'SKIP_CACHE_STORE',
  SKIP_INDEX_CLEANUP = 'SKIP_INDEX_CLEANUP',
  SKIP_INDEXING = 'SKIP_INDEXING',
  SKIP_LISTENER_NOTIFICATION = 'SKIP_LISTENER_NOTIFICATION',
  SKIP_LOCKING = 'SKIP_LOCKING',
  SKIP_OWNERSHIP_CHECK = 'SKIP_OWNERSHIP_CHECK',
  SKIP_REMOTE_LOOKUP = 'SKIP_REMOTE_LOOKUP',
  SKIP_SHARED_CACHE_STORE = 'SKIP_SHARED_CACHE_STORE',
  SKIP_SIZE_OPTIMIZATION = 'SKIP_SIZE_OPTIMIZATION',
  SKIP_STATISTICS = 'SKIP_STATISTICS',
  SKIP_XSITE_BACKUP = 'SKIP_XSITE_BACKUP',
  ZERO_LOCK_ACQUISITION_TIMEOUT = 'ZERO_LOCK_ACQUISITION_TIMEOUT'
}

class Utils {
  public isDevMode(): boolean {
    return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  }

  /**
   * Decide the endpoint depending if we are in dev mode or production mode
   */
  public endpoint(): string {
    if (this.isDevMode()) {
      return 'http://localhost:11222/rest/v2';
    } else {
      return window.location.origin.toString() + '/rest/v2';
    }
  }

  public landing(): string {
    if (this.isDevMode()) {
      return 'http://localhost:9000/console/';
    } else {
      return window.location.origin.toString() + '/console';
    }
  }

  /**
   * Perform a REST call with body
   *
   * @param url
   * @param method
   * @param body
   * @param contentType
   */
  public restCallWithBody(
    url: string,
    method: string,
    body: string,
    contentType?: string
  ): Promise<Response> {
    let headers = this.createAuthenticatedHeader();
    if (contentType) {
      headers.append('Content-Type', contentType);
    }
    return fetch(url, {
      method: method,
      headers: headers,
      credentials: 'include',
      body: body
    });
  }

  /**
   * Perform a REST call
   *
   * @param url
   * @param method
   */
  public restCall(
    url: string,
    method: string,
    accept?: string
  ): Promise<Response> {
    let headers = this.createAuthenticatedHeader();
    if (accept && accept.length > 0) {
      headers.append('Accept', accept);
    }
    return fetch(url, {
      method: method,
      credentials: 'include',
      headers: headers
    });
  }

  public createAuthenticatedHeader = (): Headers => {
    let headers = new Headers();
    if (KeycloakService.Instance.isInitialized()) {
      headers.append(
        'Authorization',
        'Bearer ' + localStorage.getItem('react-token')
      );
    }
    return headers;
  };

  public isJSONObject(value: string): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Handle a crud op request result
   *
   * @param name of the object
   * @param successMessage
   * @param response
   */
  public async handleCRUDActionResponse(
    name: string,
    successMessage: string,
    response: Promise<Response>
  ): Promise<ActionResponse> {
    return response
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        throw response;
      })
      .then(text => {
        return <ActionResponse>{
          message: text == '' ? successMessage : text,
          success: true
        };
      })
      .catch(err => {
        if (err instanceof TypeError) {
          return <ActionResponse>{ message: err.message, success: false };
        }

        return err
          .text()
          .then(
            errorMessage =>
              <ActionResponse>{ message: errorMessage, success: false }
          );
      });
  }
}

const utils: Utils = new Utils();

export default utils;
