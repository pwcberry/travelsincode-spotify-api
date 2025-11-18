import { hasCredentials, login } from "./auth.js";
import { getMyAlbums } from "./me.js";

async function uploadData(data, fileName) {
  const response = await fetch("./upload", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      fileName,
      data,
    }),
  });

  if (response.ok) {
    const confirmation = await response.json();
    if (confirmation.uploaded) {
      console.log("UPLOADED");
    } else {
      console.error("FAILED");
    }
  } else {
    console.error("FAILED");
  }
}

window.addEventListener("load", () => {
  document.querySelector("button").addEventListener("click", async () => {
    if (hasCredentials()) {
      const albums = await getMyAlbums();
      await uploadData(albums, "albums.json");
    } else {
      login();
    }
  });
});
