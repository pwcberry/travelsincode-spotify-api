import "dotenv/config.js";
import { obtainAccessToken } from "./lib/user.js";
import { getMyAlbums } from "./lib/me.js";
import { writeToFile } from "./lib/fs.js";

async function main() {
  // See: https://developer.spotify.com/documentation/web-api/tutorials/getting-started
  const { access_token: bearer } = await obtainAccessToken();
  const albums = await getMyAlbums(bearer);
  await writeToFile(albums, "albums.json");
}

await main();
