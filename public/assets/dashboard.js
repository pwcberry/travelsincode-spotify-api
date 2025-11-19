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

async function fetchAlbums() {
  let result = await getMyAlbums(20);
  let countdown = result.total;
  let offset = 0;

  while (countdown > 0) {
    const filename = `albums-${offset.toString().padStart(3, "0")}.json`;
    console.log("Uploading:", filename);
    try {
      await uploadData(result.albums, filename);
      countdown -= result.limit;
      offset += result.limit;
      result = await getMyAlbums(20, offset);
    } catch (error) {
      console.error(error);
      countdown = 0;
    }
  }
}

window.addEventListener("load", () => {
  document.querySelector("#btn_albums").addEventListener("click", async () => {
    if (hasCredentials()) {
      await fetchAlbums();
    } else {
      login();
    }
  });
});
