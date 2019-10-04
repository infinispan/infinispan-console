class Utils {
  public endpoint(): string {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      return 'http://localhost:11222/rest/v2';
    } else {
      return window.location.origin.toString() + '/rest/v2';
    }
  }
}

const utils: Utils = new Utils();

export default utils;
