import { describe, it } from "mocha";
import { assert } from "chai";
import { generateRandomString, generateUUID } from "../lib/util.js";

describe("util", () => {
  describe("generateRandomString", () => {
    it("should generate string of 16 characters in length", () => {
      const secret = generateRandomString();
      assert.equal(secret.length, 16);
    });
  });

  describe("generateUUID", () => {
    it("should generate a valid UUID", () => {
      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      assert.match(uuid, uuidRegex);
    });
  })
});
