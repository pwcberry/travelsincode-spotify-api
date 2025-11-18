import { createServer } from "node:https";
import { loadEnvFile } from "node:process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { HttpRequest, HttpResponse } from "./lib/http.js";
import getLogger from "./lib/log.js";
import * as controller from "./lib/controller.js";
import { loadAsset } from "./lib/asset.js";
import { uploadData } from "./lib/upload.js";
import * as upload from "./lib/upload.js";

loadEnvFile();

function serve(port) {
  const logger = getLogger();

  const options = {
    keepAliveTimeout: 30000,
    IncomingMessage: HttpRequest,
    ServerResponse: HttpResponse,
    key: readFileSync(join(process.cwd(), "cert/selfsigned.key")),
    cert: readFileSync(join(process.cwd(), "cert/selfsigned.pem")),
  };

  const server = createServer(options, async (request, response) => {
    logger.request(request.requestUrl, request.headers);

    switch (request.pathname) {
      case "/":
        await controller.indexPage(request, response);
        break;
      case "/dashboard":
        await controller.dashboardPage(request, response);
        break;
      case "/error":
        await controller.errorPage(request, response);
        break;
      case "/login":
        await controller.loginRequest(request, response);
        break;
      case "/callback":
        await controller.spotifyCallback(request, response);
        break;
      case "/upload":
        await upload.uploadData(request, response);
        break;
      default:
        if (/^\/assets/.test(request.pathname)) {
          await loadAsset(request, response);
        } else {
          logger.error(`Resource ${request.pathname} not found`);
          response.setNotFound();
        }
        break;
    }
  });

  logger.info("Listening on port: " + port);
  server.listen(port);
}

serve(443);
