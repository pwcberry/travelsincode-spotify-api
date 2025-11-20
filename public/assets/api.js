import { getBearer } from "./auth.js";

const API_URL_PREFIX = "https://api.spotify.com/v1/";

/**
 * Standard calls to the Spotify API.
 *
 * @param pathStem {string} The stem to add to the API URL prefix
 * @param options {object} Options to pass to the `fetch` function
 * @param [options.params] {URLSearchParams} The parameters to set the query string for the request
 * @returns {Promise<Object>}
 */
async function apiGet(pathStem, options = {}) {
  const { params } = options;
  const path = pathStem + (params?.size > 0 ? `?${params}` : "");

  const url = new URL(path, API_URL_PREFIX);
  const headers = new Headers();
  headers.append("Authorization", getBearer());

  const response = await fetch(url, { method: "GET", headers });
  if (response.ok) {
    return await response.json();
  } else {
    return { error: `Error: ${response.status}` };
  }
}

/**
 * @param {string} playlistId
 * @param {number} limit
 * @param {number} [offset]
 * @return {Promise<Object>}
 */
async function getPlaylistTracks(playlistId, limit, offset = 0) {
  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());
  // TODO: Map to slim object
  return await apiGet(`./playlists/${playlistId}/tracks`, { params });
}

export { apiGet, getPlaylistTracks };
