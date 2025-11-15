import { IncomingMessage, ServerResponse } from "node:http";
import process from "node:process";

const COOKIE_HEADER = "cookie";
const SET_COOKIE_HEADER = "set-cookie";

const HTTP_CONTENT_TYPE = {
  HTML: "text/html",
  JSON: "application/json",
};

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
   * @param keyValueTuples {string[][]} The cookies, as an array of name-value pairs, to add
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
    this.appendHeaders([
      ["content-type", "text/plain"],
      ["location", location instanceof URL ? location.toString() : location],
      ["date", new Date().toUTCString()],
    ]);
    this.writeHead(307);
    this.end();
  }

  /**
   * Write JSON to the response body.
   * @param data {Object|Array} The data to write in the response
   */
  sendJson(data) {
    this.writeOutput(JSON.stringify({ data }), HTTP_CONTENT_TYPE.JSON);
  }

  /**
   * Write HTML to the response body.
   * @param html {string} The HTML to write in the response
   */
  sendHtml(html) {
    this.writeOutput(html, HTTP_CONTENT_TYPE.HTML);
  }

  /**
   * Writes the content with the specified HTTP content type.
   * @param content {string|Buffer} The content to write to the output stream
   * @param contentType {string} The HTTP content type to specify for the response
   */
  writeOutput(content, contentType) {
    try {
      const output = typeof content === "string" ? Buffer.from(content, "utf8") : content;
      this.appendHeaders([
        ["content-type", contentType],
        ["content-length", output.length],
      ]);
      this.writeHead(200);
      this.write(output);
      this.end("\n");
    } catch {
      this.writeHead(500);
      this.end();
    }
  }

  /**
   * Add headers to the response before writing to the output stream.
   * @param keyValueTuples {string[][]} The headers, as an array of name-value pairs, to add
   */
  appendHeaders(keyValueTuples) {
    if (Array.isArray(keyValueTuples) && keyValueTuples.length > 0) {
      this.setHeaders(new Map([...keyValueTuples, ...Object.entries(this.getHeaders())]));
    }
  }

  /**
   * Respond to the request with a "Not Found" status.
   */
  setNotFound() {
    this.writeHead(404, "Not Found");
    this.end();
  }

  /**
   * Respond to the request with a "Internal Server Error" status.
   */
  setServerError() {
    this.writeHead(500, "Internal Server Error");
    this.end();
  }
}

export { HttpRequest, HttpResponse };
