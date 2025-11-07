import crypto from "node:crypto";

/**
 * Generate a random string of hexadecimal characters with a specified length.
 * @param length {number} The length of the random string to generate. Default is 16.
 * @return {string}
 */
function generateRandomString(length = 16) {
  return crypto.randomBytes(60).toString("hex").slice(0, length);
}

/**
 * Generate a UUID (Universally Unique Identifier).
 * @return {UUID} Returns a randomly generated UUID as a string.
 */
function generateUUID() {
  return crypto.randomUUID();
}

export { generateRandomString, generateUUID };
