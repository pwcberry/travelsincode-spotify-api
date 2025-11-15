import { mkdir, open, opendir } from "node:fs/promises";
import { join } from "node:path";

async function checkDir(path) {
  let dirCreated;
  try {
    await opendir(path);
    dirCreated = false;
  } catch (error) {
    if (error.code === "ENOENT") {
      await mkdir(path, { recursive: true });
      dirCreated = true;
    }
  }

  return dirCreated;
}

/**
 * Write JSON data to a file in the "data" directory.
 * @param data {Object} The data to store
 * @param fileName {string} The file name for the data
 */
async function writeToDataFile(data, fileName) {
  const dataDir = join(import.meta.dirname, "../data");
  await checkDir(dataDir);
  const filepath = join(dataDir, fileName);

  let handle;
  try {
    handle = await open(filepath, "w");
    await handle.writeFile(JSON.stringify(data, null, 2), { encoding: "utf8" });
  } catch (error) {
    console.error(error);
  } finally {
    handle?.close();
  }
}

/**
 * Read a HTML file from the file system.
 * @param fileName The name of the file
 */
async function readFileForWeb(fileName) {
  const publicDir = join(import.meta.dirname, "../public");
  const filepath = join(publicDir, fileName);

  let handle, content, statusCode;
  try {
    handle = await open(filepath, "r");
    content = await handle.readFile({ encoding: "utf8" });
    statusCode = 200;
  } catch (error) {
    console.error(error);
    if (error.code === "ENOENT") {
      content = "NOT FOUND";
      statusCode = 404;
    } else {
      content = "ERROR";
      statusCode = 500;
    }
  } finally {
    handle?.close();
  }

  return [statusCode, content];
}

export { readFileForWeb, writeToDataFile };
