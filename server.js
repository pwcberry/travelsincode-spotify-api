import "dotenv/config.js";
import { createServer } from "node:http";
import process from "node:process";
import { URL } from "node:url";
import { readFileSync } from "node:fs";
import { join, extname } from "node:path";
import { Buffer, isUtf8 } from "node:buffer";

function processRequest(url, headerAccept) {
  let statusCode, contentType, data;

  try {
  } catch (error) {
    contentType = "text/plain";
    data = "";

    if (error.code === "ENOENT") {
      statusCode = 404;
    } else {
      statusCode = 500;
    }
  }

  return [statusCode, contentType, data];
}

function serve(port) {
  const server = createServer({ keepAliveTimeout: 30000 }, (req, res) => {
    // This script will always handle requests made with the HTTP protocol from localhost
    // const requestUrl = new URL(req.url, `http://127.0.0.1`);

    // const [statusCode, contentType, data] = processRequest(requestUrl, req.headers);
    const [statusCode, contentType, data] = [200, "text/html", "<p>HELLO WORLD</p>"];
    const contentLength = Buffer.byteLength(data, "utf8");

    res.setHeaders(
      new Map([
        ["Content-Type", contentType],
        ["Content-Length", contentLength],
      ])
    );
    res.writeHead(statusCode);

    res.write(data);
    res.end("\n");
  });

  console.log("Listening on port:", port);
  server.listen(port);
}

serve(4000);
