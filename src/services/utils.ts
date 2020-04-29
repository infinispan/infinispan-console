/**
 * Utility class
 *
 * @author Katia Aresti
 */
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

  /**
   * Perform a REST call
   *
   * @param url
   * @param method
   */
  public restCall(url: string, method: string): Promise<Response> {
    let headers = new Headers();
    return fetch(url, {
      method: method,
      credentials: 'include',
      headers: headers
    });
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
    contentType: string
  ): Promise<Response> {
    let headers = new Headers();
    headers.append('Content-Type', contentType);
    return fetch(url, {
      method: method,
      headers: headers,
      credentials: 'include',
      body: body
    });
  }
}

const utils: Utils = new Utils();

export default utils;
