import crypto from "node:crypto";

function generateRandomString(length = 16) {
  return crypto.randomBytes(60).toString("hex").slice(0, length);
}

export { generateRandomString };
