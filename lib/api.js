/**
 * Standard calls to the Spotify API.
 *
 * @param pathStem {string} The stem to add to the API URL prefix
 * @param options {object} Options to pass to the `fetch` function
 * @param options.params {URLSearchParams} The parameters to set the query string for the request
 * @param options.bearer {string} The bearer token for authentication
 * @returns {Promise<void>}
 */

const API_URL_PREFIX = "https://api.spotify.com/v1/";

async function apiGet(pathStem, options) {
  const { bearer, params } = options;
  const path = pathStem + (params?.size > 0 ? `?${params}` : "");
  const url = new URL(path, API_URL_PREFIX);
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${bearer}`);

  const response = await fetch(url, { headers });
  if (response.ok) {
    return await response.json();
  } else {
    return `Error: ${response.status}`;
  }
}

export { apiGet };
