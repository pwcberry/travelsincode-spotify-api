import { open } from "node:fs/promises";
import { join } from "node:path";

async function writeToDataFile(data, fileName) {
  const dataDir = join(import.meta.dirname, "../data");
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

  let handle, content;
  try {
    handle = await open(filepath, "r");
    content = await handle.readFile({ encoding: "utf8" });
  } catch (error) {
    console.error(error);
  } finally {
    handle?.close();
  }

  return content;
}

export { readFileForWeb, writeToDataFile };
