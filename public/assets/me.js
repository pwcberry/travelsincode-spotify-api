/**
 * Accessing the "me" endpoint on the Spotify API.
 */
import { apiGet } from "./api.js";
import { Album } from "./transform.js";

async function getMyAlbums(size = 50, offset = 0) {
  const params = new URLSearchParams();
  params.append("size", size.toString());
  params.append("offset", offset.toString());
  const result = await apiGet("./me/albums", { params });
  return {
    limit: result.limit,
    offset: result.offset,
    total: result.total,
    albums: result.items.map((album) => new Album(album)),
  };
}

async function getMyProfile() {
  return await apiGet("./me");
}

export { getMyAlbums, getMyProfile };
