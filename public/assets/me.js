/**
 * Accessing the "me" endpoint on the Spotify API.
 */
import { apiGet } from "./api.js";
import { Album } from "./transform.js";

/**
 * @param {number} size
 * @param {number} offset
 * @return {Promise<Object>}
 */
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

/**
 * @param {number} limit
 * @param {number} offset
 * @return {Promise<Object>}
 */
async function getMyShows(limit = 20, offset = 0) {
  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());
  // TODO: Map to slim object
  return await apiGet("./me/shows", { params });
}

/**
 * @param {number} limit
 * @param {number} offset
 * @return {Promise<Object>}
 */
async function getMyPlaylists(limit = 20, offset = 0) {
  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());
  // TODO: Map to slim object
  return await apiGet("./me/playlists", { params });
}

/**
 * @param {number} limit
 * @param {string} [lastArtistId]
 * @return {Promise<Object>}
 */
async function getMyArtists(limit, lastArtistId = "") {
  const params = new URLSearchParams();
  params.append("type", "artist");
  params.append("after", lastArtistId);
  params.append("limit", limit.toString());
  // TODO: Map to slim object
  const { artists } = await apiGet("./me/following", { params });
  return artists;
}

async function getMyProfile() {
  return await apiGet("./me");
}

export { getMyAlbums, getMyArtists, getMyPlaylists, getMyProfile, getMyShows };
