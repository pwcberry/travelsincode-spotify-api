import { describe, it } from "mocha";
import { assert } from "chai";
import { clearCookieHeader, parseCookieHeader, setCookieHeader } from "../lib/http.js";

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

    it("should return an empty object when there are no cookies to parse", () => {
      const headers = {};
      const cookies = parseCookieHeader(headers);
      assert.deepEqual(cookies, {});
    });
  });

  describe("clearCookieHeader", () => {
    it("should not have any header settings when there are no cookies to clear", () => {
      const headers = {
        cookie: "",
      };
      const responseCookies = clearCookieHeader(headers);
      assert.isArray(responseCookies);
      assert.lengthOf(responseCookies, 0);
    });

    it("should reset each cookie in the request header", () => {
      const headers = {
        cookie: "foo=bar; id=1234",
      };
      const responseCookies = clearCookieHeader(headers);
      assert.isArray(responseCookies);
      assert.lengthOf(responseCookies, 2);
      assert.deepEqual(responseCookies[0], ["Set-Cookie", "foo=; Max-Age=0"]);
      assert.deepEqual(responseCookies[1], ["Set-Cookie", "id=; Max-Age=0"]);
    });
  });

  describe("setCookieHeader", () => {
    it("should only set a new cookie when there are no cookies in the request", () => {
      const headers = {};
      const responseCookies = setCookieHeader(headers, [["foo", "bar"]]);
      assert.isArray(responseCookies);
      assert.lengthOf(responseCookies, 1);
      assert.deepEqual(responseCookies[0], ["Set-Cookie", "foo=bar"]);
    });

    it("should copy request cookies to the request header when no new cookies are set", () => {
      const headers = {
        cookie: "foo=bar; id=1234",
      };
      const responseCookies = setCookieHeader(headers, []);
      assert.lengthOf(responseCookies, 2);
      assert.deepEqual(responseCookies[0], ["Set-Cookie", "foo=bar"]);
      assert.deepEqual(responseCookies[1], ["Set-Cookie", "id=1234"]);
    });

    it("should copy request cookies and set new cookies", () => {
      const headers = {
        cookie: "foo=bar; id=1234",
      };
      const newCookies = new Map([
        ["state", "sleep"],
        ["client", "dreaming"],
      ]);
      const responseCookies = setCookieHeader(headers, newCookies);
      assert.lengthOf(responseCookies, 4);
      assert.deepEqual(responseCookies[0], ["Set-Cookie", "foo=bar"]);
      assert.deepEqual(responseCookies[1], ["Set-Cookie", "id=1234"]);
      assert.deepEqual(responseCookies[2], ["Set-Cookie", "state=sleep"]);
      assert.deepEqual(responseCookies[3], ["Set-Cookie", "client=dreaming"]);
    });
  });
});
