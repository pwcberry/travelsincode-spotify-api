import { mkdir, open, openDir } from "node:fs/promises";
import { join } from "node:path";

async function checkDir(path) {
  let dirCreated;
  try {
    await openDir(path);
    dirCreated = false;
  } catch (error) {
    if (error.code === "ENOENT") {
      mkdir(path, { recursive: true });
      dirCreated = true;
    }
  }

  return dirCreated;
}

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

async function readFileForWeb(fileName) {
  const publicDir = join(import.meta.dirname, "../public");
  const filepath = join(publicDir, fileName);

  let handle, content, statusCode;
  try {
    handle = await open(filepath, "r");
    content = await handle.readFile({ encoding: "utf8" });
    statusCode = 200;
  } catch (error) {
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
