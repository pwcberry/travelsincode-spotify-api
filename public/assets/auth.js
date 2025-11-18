function hasCredentials() {
  if (window.SPOTIFY?.expiresAt) {
    const now = new Date();
    const expiry = new Date(window.SPOTIFY.expiresAt);
    if (now.valueOf() < expiry.valueOf()) {
      return true;
    }
  }
  return false;
}

function getBearer() {
  if (hasCredentials()) {
    const { access_token } = window.SPOTIFY;
    return `Bearer ${access_token}`;
  }

  return "";
}

function login() {
  const page = new URL(location.href);
  const loginPage = new URL("login", page.origin);
  location.href = loginPage.toString();
}

export { getBearer, hasCredentials, login };
