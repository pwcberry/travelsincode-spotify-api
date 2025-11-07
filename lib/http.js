const HEADER_NAME = "cookie";
const SET_HEADER_NAME = "set-cookie";

/**
 *
 * @param httpHeaders {Object} The HTTP header object attached to the request IncomingMessage class
 * @returns {{}|null} An object that pairs the key/value items present in the cookie; otherwise null
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

function clearCookieHeader(requestHttpHeaders) {
  const requestCookie = parseCookieHeader(requestHttpHeaders);
  if (requestCookie !== null) {
    const responseCookie = ["Set-Cookie"];
    responseCookie[1] = Object.entries(requestCookie).map(([key]) => `${key}=; Max-Age=0`);
    return responseCookie;
  }
  return [];
}

export { parseCookieHeader, clearCookieHeader };
