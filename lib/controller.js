import { generateRandomString } from "./util.js";
import { setCookieHeader } from "./http.js";

// TODO:
// See the example at https://github.com/spotify/web-api-examples/blob/master/authorization/authorization_code/app.js
const SPOTIFY_ACCOUNT_URL = "https://accounts.spotify.com";
const SPOTIFY_STATE_KEY = "spotify_auth_state";

/**
 *
 * @param response
 * @param headers {Object}
 * @param redirectUri {string}
 */
function handleLoginRequest(response, headers, redirectUri) {
  const authState = generateRandomString();
  const httpCookies = setCookieHeader(headers, SPOTIFY_STATE_KEY, authState);

  const url = new URL("authorize", SPOTIFY_ACCOUNT_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env.SPOTIFY_CLIENT_ID);
  url.searchParams.set("scope", "user-read-private user-read-email");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", authState);

  response.setHeaders(
    new Map([
      ["Content-Type", "text/plain"],
      ["Location", url.toString()],
      ["Date", new Date().toUTCString()],
      httpCookies,
    ])
  );
  response.writeHead(307);
  response.end();
}

/**
 *
 * @param requestUrl
 * @param headers
 */
function handleSpotifyCallback(requestUrl, headers) {}

export { handleLoginRequest, handleSpotifyCallback };
