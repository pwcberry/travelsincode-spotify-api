import { generateRandomString } from "./util.js";
import { readFileForWeb, readFromDataFile, writeToDataFile } from "./fs.js";
import getLogger from "./log.js";

// See the example at https://github.com/spotify/web-api-examples/blob/master/authorization/authorization_code/app.js
const SPOTIFY_ACCOUNT_URL = "https://accounts.spotify.com";
const SPOTIFY_STATE_KEY = "spotify_auth_state";

async function indexPage(request, response) {
  const [statusCode, content] = await readFileForWeb("index.html");

  if (statusCode === 200) {
    const tokens = await readFromDataFile("tokens.json");
    let output = content;

    if (tokens) {
      const spotify = { ...tokens, app_name: process.env["SPOTIFY_APP_NAME"] };
      output = output.replace(
        "<!-- INSERT TOKENS -->",
        `
<script type="text/javascript">
window.SPOTIFY = ${JSON.stringify(spotify)};    
</script>
    `
      );
    }
    response.sendHtml(output);
  } else if (statusCode === 404) {
    response.setNotFound();
  } else if (statusCode === 500) {
    response.setServerError();
  }
}

/**
 * @param request {HttpRequest}
 * @param response {HttpResponse}
 */
async function loginRequest(request, response) {
  const authState = generateRandomString();
  response.setCookie(SPOTIFY_STATE_KEY, authState);

  const url = new URL("authorize", SPOTIFY_ACCOUNT_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", request.context.env.SPOTIFY_CLIENT_ID);
  url.searchParams.set("scope", "user-read-private user-read-email");
  url.searchParams.set("redirect_uri", request.context.env.REDIRECT_URI);
  url.searchParams.set("state", authState);

  getLogger().info("Spotify login request: " + url.toString());

  response.redirect(url);
}

/**
 *
 * @param request {HttpRequest}
 * @param response {HttpResponse}
 */
async function spotifyCallback(request, response) {
  const logger = getLogger();
  const { code, state } = request.query ?? { code: "", state: "" };

  if (!(code || state)) {
    logger.error(`Bad request: query parameters "code" or "state" not found`);
    response.setBadRequest();
    return;
  }

  const storedState = request.cookies[SPOTIFY_STATE_KEY] ?? "";
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, REDIRECT_URI, HOST } = request.context.env;

  if (typeof state === "undefined" || state !== storedState) {
    const errorUrl = new URL(HOST);
    errorUrl.searchParams.set("error", "state_mismatch");
    logger.error("Spotify state mismatch");
    response.redirect(errorUrl);
  } else {
    response.clearCookie(SPOTIFY_STATE_KEY);

    const formData = new FormData();
    formData.append("code", code);
    formData.append("redirect_uri", REDIRECT_URI);
    formData.append("grant_type", "authorization_code");

    const requestInit = {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        accepts: "application/json",
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: formData,
    };

    const apiUrl = new URL("/api/token", SPOTIFY_ACCOUNT_URL);
    logger.info("Requesting tokens for Spotify API");

    try {
      const response = await fetch(apiUrl, requestInit);
      if (response.ok) {
        const data = await response.json();
        const { access_token, refresh_token } = data;

        await writeToDataFile({ access_token, refresh_token }, "tokens.json");

        logger.info("Spotify API tokens received");

        const redirectUrl = new URL(HOST);
        redirectUrl.searchParams.set("access_token", access_token);
        redirectUrl.searchParams.set("refresh_token", refresh_token);
        response.redirect(redirectUrl);
      }
    } catch {
      const redirectUrl = new URL(HOST);
      logger.error("Spotify token is invalid");
      redirectUrl.searchParams.set("error", "invalid_token");
      response.redirect(redirectUrl);
    }
  }
}

export { indexPage, loginRequest, spotifyCallback };
