import { createServer } from "node:http";
import { loadEnvFile } from "node:process";
import { HttpRequest, HttpResponse } from "./lib/http.js";
import getLogger from "./lib/log.js";
import * as controller from "./lib/controller.js";

loadEnvFile();

function serve(port) {
  const logger = getLogger();

  const server = createServer(
    { keepAliveTimeout: 30000, IncomingMessage: HttpRequest, ServerResponse: HttpResponse },
    async (request, response) => {
      logger.request(request.requestUrl, request.headers);

      switch (request.pathname) {
        case "/":
          await controller.indexPage(request, response);
          break;
        case "/login":
          await controller.loginRequest(request, response);
          break;
        case "/callback":
          await controller.spotifyCallback(request, response);
          break;
        default:
          response.setNotFound();
          break;
      }
    }
  );

  logger.info("Listening on port: " + port);
  server.listen(port);
}

serve(4000);
