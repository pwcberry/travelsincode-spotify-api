import "dotenv/config.js";
import { obtainAccessToken } from "./lib/user.js";
import { getMyAlbums } from "./lib/me.js";
import { writeToDataFile } from "./lib/fs.js";

async function main() {
  // See: https://developer.spotify.com/documentation/web-api/tutorials/getting-started
  const { access_token: bearer } = await obtainAccessToken();
  const albums = await getMyAlbums(bearer);
  await writeToDataFile(albums, "albums.json");
}

await main();
