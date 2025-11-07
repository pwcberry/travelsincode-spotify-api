import { describe, it } from "mocha";
import { assert } from "chai";
import { parseCookieHeader } from "../lib/http.js";

describe("http", () => {
  describe("parseCookieHeader", () => {
    it("should extract exactly one cookie", () => {
      const headers = {
        cookie: "foo=bar",
      };
      const cookies = parseCookieHeader(headers);
      assert.containsAllKeys(cookies, ["foo"]);
      assert.strictEqual(cookies["foo"], "bar");
    });

    it("should extract two separate cookies", () => {
      const headers = {
        cookie: "foo=bar; id=1234",
      };
      const cookies = parseCookieHeader(headers);
      assert.containsAllKeys(cookies, ["foo", "id"]);
      assert.strictEqual(cookies["id"], "1234");
    });

    it("should return an array for multiple cookie keys", () => {
      const headers = {
        cookie: "foo=bar; id=1234; foo=raz",
      };
      const cookies = parseCookieHeader(headers);
      assert.containsAllKeys(cookies, ["foo", "id"]);
      assert.isArray(cookies["foo"]);
      assert.deepEqual(cookies["foo"], ["bar", "raz"]);
    });
  });
});
