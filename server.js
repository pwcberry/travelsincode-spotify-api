import { createServer } from "node:http";
import { loadEnvFile } from "node:process";
import { HttpRequest, HttpResponse } from "./lib/http.js";
import { readFileForWeb } from "./lib/fs.js";

loadEnvFile();

function serve(port) {
  const server = createServer(
    { keepAliveTimeout: 30000, IncomingMessage: HttpRequest, ServerResponse: HttpResponse },
    async (request, response) => {
      if (request.pathname === "/") {
        const [statusCode, content] = await readFileForWeb("index.html");
        switch (statusCode) {
          case 200:
            response.sendHtml(content);
            break;
          case 404:
            response.setNotFound();
            break;
          case 500:
            response.setServerError();
            break;
        }
      } else {
        response.setNotFound();
      }
    }
  );

  console.log("Listening on port:", port);
  server.listen(port);
}

serve(4000);
