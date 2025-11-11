import { generateRandomString } from "./util.js";

// TODO:
// See the example at https://github.com/spotify/web-api-examples/blob/master/authorization/authorization_code/app.js
const SPOTIFY_ACCOUNT_URL = "https://accounts.spotify.com";
const SPOTIFY_STATE_KEY = "spotify_auth_state";

/**
 * @param request {HttpRequest}
 * @param response {HttpResponse}
 * @param redirectUri {string}
 */
function handleLoginRequest(request, response, redirectUri) {
  const authState = generateRandomString();
  response.setCookie(SPOTIFY_STATE_KEY, authState);

  const url = new URL("authorize", SPOTIFY_ACCOUNT_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", request.context.env.SPOTIFY_CLIENT_ID);
  url.searchParams.set("scope", "user-read-private user-read-email");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", authState);

  response.redirect(url);
}

/**
 *
 * @param request {HttpRequest}
 * @param response {HttpResponse}
 */
function handleSpotifyCallback(request, response) {}

export { handleLoginRequest, handleSpotifyCallback };
