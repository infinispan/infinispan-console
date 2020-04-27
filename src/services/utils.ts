import { Either, left, right } from './either';

class Utils {
  public isDevMode(): boolean {
    return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  }

  public endpoint(): string {
    if (this.isDevMode()) {
      return 'http://localhost:11222/rest/v2';
    } else {
      return window.location.origin.toString() + '/rest/v2';
    }
  }

  public isEither(either: Either<any, any>): either is Either<any, any> {
    return (either as Eiclther<any, any>).value !== undefined;
  }

  public restCall(url: string, method: string): Promise<Response> {
    let headers = new Headers();
    return fetch(url, {
      method: method,
      credentials: 'include',
      headers: headers
    });
  }

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
