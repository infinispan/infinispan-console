import {user} from "@app/routes";

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

  public restCall(url: string, method: string): Promise<Response> {
    let headers = new Headers();
    if (!this.isDevMode()) {
      headers.set('Authorization', 'Basic ' + btoa(user.user + ":" + user.password));
    }
    return fetch(url, {
      method: method,
      headers: headers
    })
  }

  public restCallWithBody(url: string, method: string, body: string, contentType: string): Promise<Response> {
    let headers = new Headers();
    if (!this.isDevMode()) {
      headers.set('Authorization', 'Basic ' + btoa(user.user + ":" + user.password));
      headers.append('Content-Type', contentType);
    }

    return fetch(url, {
      method: method,
      headers: headers,
      body: body
    })
  }
}

const utils: Utils = new Utils();

export default utils;
