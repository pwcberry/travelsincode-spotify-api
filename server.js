import { createServer } from "node:http";
import { loadEnvFile } from "node:process";
// import { readFileSync } from "node:fs";
// import { join, extname } from "node:path";
import { Buffer } from "node:buffer";
import { HttpRequest, HttpResponse } from "./lib/http.js";

loadEnvFile();

/**
 *
 * @param request {HttpRequest} The request
 * @returns {[number,string,string[][]]} A tuple containing the HTTP status code, the HTML to return, and the cookie to set in the response
 */
function processRequest(request) {
  let statusCode, httpCookies, data;

  try {
    switch (request.pathname.toLowerCase()) {
      case "/login":
        httpCookies = [
          ["foo", "barred"],
          ["id", "456"],
        ];
        return [200, "<p>LOGIN</p>", httpCookies];
      case "/callback":
        httpCookies = [
          ["foo", "bar"],
          ["tid", "987"],
        ];
        return [200, '<p style="color:white;background:darkmagenta">CALLBACK</p>', httpCookies];
      case "/":
        return [200, "<p>HELLO WORLD</p>", ""];
      default:
        httpCookies = [];
        statusCode = 404;
        data = '<html lang="en"><title>Page not found</title><body><p>Page not found</p></body></html>';
        break;
    }
  } catch (error) {
    httpCookies = [];

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
  const server = createServer(
    { keepAliveTimeout: 30000, IncomingMessage: HttpRequest, ServerResponse: HttpResponse },
    (req, res) => {
      // This script will always handle requests made with the HTTP protocol from localhost
      const [statusCode, data, httpCookies] = processRequest(req);
      const contentLength = Buffer.byteLength(data, "utf8");

      res.setHeaders(
        new Map([
          ["Content-Type", "text/html"],
          ["Content-Length", contentLength],
        ])
      );
      if (httpCookies.length > 0) {
        res.setCookies(httpCookies);
      } else {
        res.clearCookies();
      }
      res.writeHead(statusCode);

      res.write(data);
      res.end("\n");
    }
  );

  console.log("Listening on port:", port);
  server.listen(port);
}

serve(4000);
