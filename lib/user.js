/**
 *
 * @param grantType
 * @param options {Object}
 * @param options.client_id {string}
 * @param options.client_secret {string}
 * @param [options.authorization_code] {string}
 * @param [options.redirect_uri] {string}
 * @returns {Promise<any|string>}
 */
async function obtainAccessToken(grantType, options) {
  const { client_id, client_secret } = options;
  const body = new URLSearchParams({
    grant_type: grantType,
  });
  const headers = new Headers({ "Content-Type": "application/x-www-form-urlencoded" });

  if (grantType === "client_credentials") {
    body.append("client_id", client_id);
    body.append("client_secret", client_secret);
  } else if (grantType === "authorization_code") {
    body.append("code", options.authorization_code);
    body.append("redirect_uri", options.redirect_uri);
    headers.append("Authorization", `Basic: ${Buffer.from(client_id + ":" + client_secret).toString("base64")}`);
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers,
    body,
  });

  if (response.ok) {
    return await response.json();
  } else {
    return `Error: ${response.status}`;
  }
}

/**
 * See: https://developer.spotify.com/documentation/web-api/tutorials/code-flow
 * @returns {Promise<void>}
 */
async function authorizeUser() {}

export { obtainAccessToken };
