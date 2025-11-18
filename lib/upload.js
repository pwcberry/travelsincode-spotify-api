import { writeToDataFile } from "./fs.js";
import getLogger from "./log.js";

/**
 *
 * @param request {HttpRequest}
 * @param response {HttpResponse}
 * @return {Promise<void>}
 */
async function uploadData(request, response) {
  if (request.method === "POST" && request.headers["content-type"] === "application/json") {
    getLogger().info("Content encoding: " + request.headers["content-encoding"]);

    let body = "";
    for await (const chunk of request) {
      body += Buffer.from(chunk).toString("utf8");
    }

    const { fileName, data } = JSON.parse(body);
    getLogger().info("Uploading " + fileName);
    await writeToDataFile(data, fileName);

    response.writeOutput(JSON.stringify({ uploaded: true }), "application/json");
    response.end();
  } else {
    getLogger().error(`Bad Request: METHOD: ${request.method}, Content-Type: ${request.headers["content-type"]}`);
    response.setBadRequest();
  }
}

export { uploadData };
