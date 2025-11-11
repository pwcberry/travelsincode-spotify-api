import { IncomingMessage, ServerResponse } from "node:http";
import process from "node:process";

const COOKIE_HEADER = "cookie";
const SET_COOKIE_HEADER = "set-cookie";

/**
 * Request class for use in this project.
 */
class HttpRequest extends IncomingMessage {
  #cookies = null;
  #url = null;
  #query = null;
  #context = {};

  constructor(socket) {
    super(socket);

    Object.defineProperty(this.#context, "env", {
      value: process.env,
      enumerable: true,
      configurable: false,
      writable: false,
    });
  }

  get cookies() {
    if (!this.#cookies) {
      const headers = this.headers ?? {};
      const cookieHeader = headers[COOKIE_HEADER] ?? "";

      if (cookieHeader.length > 0) {
        this.#cookies = cookieHeader.split(";").reduce((obj, item) => {
          const [key, value] = item.split("=").map((s) => s.trim());
          obj[key] = value;
          return obj;
        }, {});
      } else {
        this.#cookies = {};
      }
    }

    return this.#cookies;
  }

  get pathname() {
    if (!this.#url) {
      this.#url = new URL(this.url, this.#context.env.HOST);
    }
    return this.#url.pathname;
  }

  get query() {
    if (!this.#url) {
      this.#url = new URL(this.url, this.#context.env.HOST);
      this.#query = this.#url.searchParams.entries().reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
    }
    return this.#query;
  }

  get context() {
    return this.#context;
  }
}

class HttpResponse extends ServerResponse {
  #cookies = {};

  /**
   * Initialize a HttpResponse object.
   * @param request {HttpRequest} The request object that triggered the response.
   * @param options {Object} Configuration to pass to the base class.
   */
  constructor(request, options) {
    super(request, options);

    this.setCookies(Object.entries(request.cookies));
  }

  /**
   * Get the cookies set for the response
   * @return {Object}
   */
  get cookies() {
    return this.#cookies;
  }

  /**
   * Add a cookie to the response header.
   * @param key {string} The key of the cookie
   * @param value {string} The value to set for the cookie
   */
  setCookie(key, value) {
    this.#cookies[key] = value;

    this.setHeader(
      SET_COOKIE_HEADER,
      Object.entries(this.#cookies).map(([k, v]) => `${k}=${v}`)
    );
  }

  /**
   * Add cookies to the response header.
   * @param keyValueTuples {string[][]} The cookies to add
   */
  setCookies(keyValueTuples) {
    if (Array.isArray(keyValueTuples) && keyValueTuples.length > 0) {
      for (let [key, value] of keyValueTuples) {
        this.#cookies[key] = value;
      }

      this.setHeader(
        SET_COOKIE_HEADER,
        Object.entries(this.#cookies).map(([k, v]) => `${k}=${v}`)
      );
    }
  }

  clearCookie(key) {
    const cookieKeys = Object.keys(this.#cookies);
    if (cookieKeys.includes(key)) {
      this.setHeader(
        SET_COOKIE_HEADER,
        Object.entries(this.#cookies).map(([k, v]) => (k === key ? `${k}=; Max-Age=0` : `${k}=${v}`))
      );

      delete this.#cookies[key];
    }
  }

  clearCookies() {
    const cookieKeys = Object.keys(this.#cookies);
    if (cookieKeys.length > 0) {
      this.setHeader(
        SET_COOKIE_HEADER,
        Object.entries(this.#cookies).map(([k]) => `${k}=; Max-Age=0`)
      );

      for (const key of cookieKeys) {
        delete this.#cookies[key];
      }
    }
  }

  /**
   * Force the client to redirect to a new location.
   * @param location {URL|string}
   */
  redirect(location) {
    const responseHeaders = this.getHeaders();

    this.setHeaders(
      new Map([
        ["content-type", "text/plain"],
        ["location", location instanceof URL ? location.toString() : location],
        ["date", new Date().toUTCString()],
        ...Object.entries(responseHeaders),
      ])
    );
    this.writeHead(307);
    this.end();
  }
}

export { HttpRequest, HttpResponse };
