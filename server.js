import "dotenv/config.js";
import { createServer } from "node:http";
import process from "node:process";
import { URL } from "node:url";
import { readFileSync } from "node:fs";
import { join, extname } from "node:path";
import { Buffer, isUtf8 } from "node:buffer";
import { clearCookieHeader } from "./lib/http.js";

/**
 *
 * @param url {URL} The request URL
 * @param httpHeaders {Object} The HTTP headers of the request
 * @param httpHeaders.[cookie] {string} The HTTP cookie attached to the request
 * @returns {[number,string,string[]]} A tuple containing the HTTP status code, the HTML to return, and the cookie to set in the response
 */
function processRequest(url, httpHeaders) {
  let statusCode, httpCookies, data;

  try {
    const { pathname } = url;
    switch (pathname.toLowerCase()) {
      case "/login":
        httpCookies = ["Set-Cookie", "foo=barred; id=456"];
        return [200, "<p>LOGIN</p>", httpCookies];
      case "/callback":
        httpCookies = ["Set-Cookie", "foo=bar; tid=987"];
        return [200, '<p style="color:white;background:darkmagenta">CALLBACK</p>', httpCookies];
      case "/":
        return [200, "<p>HELLO WORLD</p>", clearCookieHeader(httpHeaders)];
      default:
        httpCookies = ["Set-Cookie", []];
        statusCode = 404;
        data = '<html lang="en"><title>Page not found</title><body><p>Page not found</p></body></html>';
        break;
    }
  } catch (error) {
    httpCookies = ["Set-Cookie", []];

    if (error.code === "ENOENT") {
      statusCode = 404;
      data = '<html lang="en"><title>Page not found</title><body><p>Page not found</p></body></html>';
    } else {
      statusCode = 500;
      data = '<html lang="en"><title>Error</title><body><p style="color:darkred">Error</p></body></html>';
    }
  }

  return [statusCode, data, httpCookies];
}

function serve(port) {
  const server = createServer({ keepAliveTimeout: 30000 }, (req, res) => {
    // This script will always handle requests made with the HTTP protocol from localhost
    const requestUrl = new URL(req.url, `http://127.0.0.1`);
    const [statusCode, data, httpCookies] = processRequest(requestUrl, req.headers);
    const contentLength = Buffer.byteLength(data, "utf8");

    res.setHeaders(new Map([["Content-Type", "text/html"], ["Content-Length", contentLength], httpCookies]));
    res.writeHead(statusCode);

    res.write(data);
    res.end("\n");
  });

  console.log("Listening on port:", port);
  server.listen(port);
}

serve(4000);
