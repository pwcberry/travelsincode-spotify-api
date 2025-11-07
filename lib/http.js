const HEADER_NAME = "cookie";
const SET_HEADER_NAME = "Set-Cookie";

/**
 * Extract cookie pairs from an incoming HTTP request. If there are no cookies present in the header, the function
 * returns null.
 * @param httpHeaders {Object} The HTTP header object attached to the request IncomingMessage class
 * @returns {{}|null} An object that pairs the key/value items present in the cookie
 */
function parseCookieHeader(httpHeaders) {
  const cookieHeader = httpHeaders[HEADER_NAME];
  if (typeof cookieHeader === "string" && cookieHeader.length > 0) {
    return cookieHeader.split(";").reduce((obj, item) => {
      const [key, value] = item.split("=").map((s) => s.trim());
      if (Object.hasOwn(obj, key)) {
        const arr = Array.isArray(obj[key]) ? arr : [obj[key]];
        arr.push(value);
        obj[key] = arr;
      } else {
        obj[key] = value;
      }
      return obj;
    }, {});
  }
  return null;
}

/**
 * Reset the cookies for an outgoing HTTP response. If there are no cookies present in the header, the function
 * returns an empty header value.
 * @param requestHttpHeaders {Object} The HTTP header object attached to the request IncomingMessage class
 * @return {string[]} The cookies as an array of name-value tuples
 */
function clearCookieHeader(requestHttpHeaders) {
  const requestCookie = parseCookieHeader(requestHttpHeaders);
  const responseCookie = [SET_HEADER_NAME];

  if (requestCookie !== null) {
    responseCookie[1] = Object.entries(requestCookie).map(([key]) => `${key}=; Max-Age=0`);
  }
  return responseCookie;
}

function setCookieHeader(httpHeaders, key, value) {
  const requestCookie = parseCookieHeader(httpHeaders);
  const responseCookie = [SET_HEADER_NAME];

  if (typeof key === "string" && key.length > 0) {
    if (requestCookie !== null) {
      requestCookie[key] = value;
      responseCookie[1] = Object.entries(requestCookie).map(([k, v]) => `${k}=${v}`);
    } else {
      responseCookie[1] = `${key}=${value};`;
    }
  }

  return responseCookie;
}

export { parseCookieHeader, clearCookieHeader, setCookieHeader };
