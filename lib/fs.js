import { mkdir, open, opendir } from "node:fs/promises";
import { join } from "node:path";
import getLogger from "./log.js";

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
    getLogger().error(error.toString());
  } finally {
    handle?.close();
  }
}

/**
 * Read JSON data from a file in the "data" directory.
 * @param fileName The data file to fetch
 * @return {Promise<Object|Array|undefined>}
 */
async function readFromDataFile(fileName) {
  const dataDir = join(import.meta.dirname, "../data");
  await checkDir(dataDir);
  const filepath = join(dataDir, fileName);

  let handle, data;
  try {
    handle = await open(filepath, "r");
    const buffer = await handle.readFile();
    data = JSON.parse(buffer.toString());
  } catch (error) {
    getLogger().error(error.toString());
  } finally {
    handle?.close();
  }

  return data;
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
    getLogger().error(error.toString());
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

export { readFromDataFile, readFileForWeb, writeToDataFile };
