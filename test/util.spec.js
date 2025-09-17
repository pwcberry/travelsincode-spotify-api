import { assert } from "chai";
import { generateRandomString } from "../lib/util.js";

describe("util", () => {
  describe("generateRandomString", () => {
    it("should generate string of 16 characters in length", () => {
      const secret = generateRandomString();
      assert.equal(secret.length, 16);
    });
  });
});
