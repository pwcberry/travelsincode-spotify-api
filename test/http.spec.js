import { assert } from "chai";
import { parseCookieHeader, clearCookieHeader } from "../lib/http.js";

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

  describe("clearCookieHeader", () => {
    it("should reset each cookie in the request header", () => {
      const headers = {
        cookie: "foo=bar; id=1234",
      };
      const responseCookies = clearCookieHeader(headers);
      assert.isArray(responseCookies);
      assert.lengthOf(responseCookies, 2);
      assert.equal(responseCookies[0], "Set-Cookie");
      assert.deepEqual(responseCookies[1], ["foo=; Max-Age=0", "id=; Max-Age=0"]);
    });
  });
});
