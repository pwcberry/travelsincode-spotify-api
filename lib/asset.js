import { extname } from "node:path";
import { readFileForWeb } from "./fs.js";

function extractContentType(model) {
  let result = "text/plain";
  ["text", "font", "image"].forEach((prefix) => {
    const media = Object.keys(model[prefix]).reduce((result, key) => {
      if (model[prefix][key] === true) {
        result = key;
      }
      return result;
    }, "");

    if (media.length > 0) {
      result = `${prefix}/${media}`;
    }
  });

  return result;
}

function whatMimeType(path) {
  const ext = extname(path);
  const model = {
    text: {
      html: /\.html?$/.test(ext),
      javascript: /\.js$/.test(ext),
      css: /\.css$/.test(ext),
    },
    font: {
      otf: ext === ".otf",
      ttf: ext === ".ttf",
      woff: ext === ".woff",
      woff2: ext === ".woff2",
    },
    image: {
      jpeg: /\.jpe?g$/.test(ext),
      png: /\.png$/.test(ext),
      svg: /\.svg$/.test(ext),
    },
  };

  return extractContentType(model);
}

/**
 *
 * @param request {HttpRequest}
 * @param response {HttpResponse}
 * @return {Promise<void>}
 */
async function loadAsset(request, response) {
  const contentType = whatMimeType(request.pathname);
  const [statusCode, content] = await readFileForWeb(request.pathname);

  if (statusCode === 200) {
    response.writeOutput(content, contentType);
  } else if (statusCode === 404) {
    response.setNotFound();
  } else if (statusCode === 500) {
    response.setServerError();
  }
}

export { loadAsset };
