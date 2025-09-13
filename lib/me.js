/**
 * Accessing the "me" endpoint on the Spotify API.
 */
import { apiGet } from "./api.js";

async function getMyAlbums(bearer, size = 30, offset = 0) {
  const params = new URLSearchParams();
  params.append("size", size.toString());
  params.append("offset", offset.toString());
  return await apiGet("me/albums", { bearer, params });
}

export { getMyAlbums };
