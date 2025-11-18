import { hasCredentials } from "./auth.js";
import { getMyAlbums } from "./me.js";

window.addEventListener("load", async () => {
  if (hasCredentials()) {
    const albums = await getMyAlbums();
    console.dir(albums);
  } else {
    // TODO: Show error
  }
});
