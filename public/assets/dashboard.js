import { hasCredentials, login } from "./auth.js";
// import { getMyAlbums } from "./me.js";
import * as me from "./me.js";
import { apiGet, getPlaylistTracks } from "./api.js";

async function uploadData(data, filename) {
  console.log("Uploading:", filename);
  const response = await fetch("./upload", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      fileName: filename,
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

/**
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
*/

async function fetchMyShowsRaw() {
  let result = await me.getMyShows(10);
  let countdown = result.total;
  let offset = 0;

  while (countdown > 0) {
    const filename = `raw-shows-${offset.toString().padStart(3, "0")}.json`;

    try {
      await uploadData(result, filename);
      countdown -= result.limit;
      offset += result.limit;
      result = await me.getMyShows(10, offset);
    } catch (error) {
      console.error(error);
      countdown = 0;
    }
  }
}

async function fetchMyPlaylistsRaw() {
  let result = await me.getMyPlaylists(20);
  let countdown = result.total;
  let offset = 0;

  while (countdown > 0) {
    const filename = `raw-playlist-${offset.toString().padStart(3, "0")}.json`;

    try {
      await uploadData(result, filename);
      countdown -= result.limit;
      offset += result.limit;
      result = await me.getMyPlaylists(20, offset);
    } catch (error) {
      console.error(error);
      countdown = 0;
    }
  }
}

async function fetchMyArtistsRaw() {
  let result = await me.getMyArtists(20);
  let countdown = result.total;
  let index = 0;

  while (countdown > 0) {
    const filename = `raw-artist-${index.toString().padStart(3, "0")}.json`;

    try {
      await uploadData(result, filename);
      countdown -= result.limit;
      const lastArtistId = result.items[result.items.length - 1].id;
      result = await me.getMyArtists(20, lastArtistId);
      index += 1;
    } catch (error) {
      console.error(error);
      countdown = 0;
    }
  }
}

async function fetchMyAlbumsRaw() {
  const params = new URLSearchParams();
  params.append("size", "20");
  params.append("offset", "10");
  const result = await apiGet("./me/albums", { params });
  const filename = "raw-albums.json";
  try {
    await uploadData(result, filename);
  } catch (error) {
    console.error(error);
  }
}

async function fetchMyProfileRaw() {
  try {
    const result = await me.getMyProfile();
    const filename = "my-profile.json";
    console.log("Uploading:", filename);
    await uploadData(result, filename);
  } catch (error) {
    console.error(error);
  }
}

async function fetchMyPlaylistTracksRaw(playlistId) {
  let result = await getPlaylistTracks(playlistId, 20);
  let countdown = result.total;
  let offset = 0;

  while (countdown > 0) {
    const filename = `playlist-${playlistId}-${offset.toString().padStart(3, "0")}.json`;

    try {
      await uploadData(result, filename);
      countdown -= result.limit;
      offset += result.limit;
      result = await getPlaylistTracks(playlistId, 20, offset);
    } catch (error) {
      console.error(error);
      countdown = 0;
    }
  }
}

async function fetchMyPlaylistsIDs() {
  let result = await me.getMyPlaylists(20);
  let countdown = result.total;
  let offset = 0;
  /** @member {string[]} */
  const ids = [];

  while (countdown > 0) {
    ids.push(...result.items.map((playlist) => playlist.id));
    countdown -= result.limit;
    offset += result.limit;
    result = await me.getMyPlaylists(20, offset);
  }

  return ids;
}

/**
 *
 * @param {Function} fetcher
 */
async function fetchResource(fetcher) {
  if (hasCredentials()) {
    return await fetcher();
  } else {
    login();
  }
}

function* range(min, max) {
  for (let i = min; i <= max; i += 1) {
    yield i;
  }
}

async function timeout(seconds = 15) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

window.addEventListener("load", async () => {
  // await fetchResource(fetchMyProfileRaw);
  // document.querySelector("#btn_albums").addEventListener("click", async () => await fetchResource(fetchMyAlbumsRaw));
  // document.querySelector("#btn_artists").addEventListener("click", async () => await fetchResource(fetchMyArtistsRaw));
  // document
  //   .querySelector("#btn_playlists")
  //   .addEventListener("click", async () => await fetchResource(fetchMyPlaylistsRaw));
  // document.querySelector("#btn_shows").addEventListener("click", async () => await fetchResource(fetchMyShowsRaw));
  if (!hasCredentials()) {
    login();
    return;
  }

  document.querySelector("#btn_playlists").addEventListener("click", async () => {
    let playlist_ids = JSON.parse(localStorage.getItem("playlist_ids")) ?? [];
    if (playlist_ids.length === 0) {
      playlist_ids = await fetchResource(fetchMyPlaylistsIDs);
      localStorage.setItem("playlist_ids", JSON.stringify(playlist_ids));
    }

    let maxIndex = playlist_ids.length - 1;
    const limit = 5;
    while (maxIndex > 0) {
      const minIndex = Math.max(maxIndex - limit + 1, 0);
      const requests = [];
      for (const i of range(minIndex, maxIndex)) {
        requests.push(fetchMyPlaylistTracksRaw(playlist_ids[i]));
      }
      console.log("Processing these ids:", minIndex, maxIndex);
      try {
        await Promise.all(requests);
        console.info("Pausing...");
        await timeout(randomInt(5, 15));
        maxIndex -= limit;
      } catch (error) {
        console.error(error);
        maxIndex = 0;
      } finally {
        console.info("FINISHED");
      }
    }
  });
});
