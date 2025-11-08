import { IncomingMessage } from "node:http";

const HEADER_NAME = "cookie";
const SET_HEADER_NAME = "Set-Cookie";

/**
 * Extract cookie pairs from an incoming HTTP request. If there are no cookies present in the header, the function
 * returns null.
 * @param httpHeaders {Object} The HTTP header object attached to the request IncomingMessage class
 * @returns {Object} An object that pairs the key/value items present in the cookie
 */
function parseCookieHeader(httpHeaders) {
  const cookieHeader = httpHeaders[HEADER_NAME];
  if (typeof cookieHeader === "string" && cookieHeader.length > 0) {
    return cookieHeader.split(";").reduce((obj, item) => {
      const [key, value] = item.split("=").map((s) => s.trim());
      obj[key] = value;
      return obj;
    }, {});
  }
  return {};
}

/**
 * Reset the cookies for an outgoing HTTP response. If there are no cookies present in the header, the function
 * returns an empty header value.
 * @param requestHttpHeaders {Object} The HTTP header object attached to the request IncomingMessage class
 * @return {string[][]} The cookies as an array of name-value tuples
 */
function clearCookieHeader(requestHttpHeaders) {
  const requestCookie = parseCookieHeader(requestHttpHeaders);
  const responseCookie = [];

  if (requestCookie !== null) {
    responseCookie.push(...Object.entries(requestCookie).map(([key]) => [SET_HEADER_NAME, `${key}=; Max-Age=0`]));
  }
  return responseCookie;
}

/**
 *
 * @param httpHeaders {Object} The HTTP header object attached to the request IncomingMessage class
 * @param cookies {string[][]|Map} An array of name-value tuples or a Map to specify the cookies to set
 * @return {string[][]} The cookies as an array of name-value tuples
 */
function setCookieHeader(httpHeaders, cookies) {
  const requestCookies = parseCookieHeader(httpHeaders);
  const responseCookies = [];
  const newCookies = cookies instanceof Map ? cookies : new Map(cookies);

  for (let [key, value] of Object.entries(requestCookies)) {
    if (!newCookies.has(key)) {
      responseCookies.push([SET_HEADER_NAME, `${key}=${value}`]);
    }
  }

  if (newCookies.size > 0) {
    responseCookies.push(...newCookies.entries().map(([key, value]) => [SET_HEADER_NAME, `${key}=${value}`]));
  }

  return responseCookies;
}

/**
 * Sets up a redirect for the client with the current HTTP response.
 * @param response {ServerResponse} The response object of the HTTP process
 * @param url {URL|string} The URI for the client to redirect to
 * @param headers {string[][]} An array of HTTP header string tuples to add to the redirect
 */
function setRedirect(response, url, headers = []) {
  response.setHeaders(
    new Map([
      ["Content-Type", "text/plain"],
      ["Location", url instanceof URL ? url.toString() : url],
      ["Date", new Date().toUTCString()],
      ...headers,
    ])
  );
  response.writeHead(307);
  response.end();
}

/**
 * Request class for use in this project.
 */
class HttpRequest extends IncomingMessage {
  #cookies = null;
  #url = null;
  #query = null;

  constructor(socket) {
    super(socket);
  }

  get cookies() {
    if (!this.#cookies) {
      const headers = this.headers ?? {};
      const cookieHeader = headers[HEADER_NAME] ?? "";
      this.#cookies = cookieHeader.split(";").reduce((obj, item) => {
        const [key, value] = item.split("=").map((s) => s.trim());
        obj[key] = value;
        return obj;
      }, {});
    }

    return this.#cookies;
  }

  get pathname() {
    if (!this.#url) {
      this.#url = new URL(this.url, process.env.HOST);
    }
    return this.#url.pathname;
  }

  get query() {
    if (!this.#url) {
      this.#url = new URL(this.url, process.env.HOST);
      this.#query = this.#url.searchParams.entries().reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
    }
    return this.#query;
  }
}

export { parseCookieHeader, clearCookieHeader, setCookieHeader, setRedirect, HttpRequest };
