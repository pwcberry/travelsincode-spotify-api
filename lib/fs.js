import { open } from "node:fs/promises";
import { join } from "node:path";

async function writeToFile(data, fileName) {
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

export { writeToFile };
