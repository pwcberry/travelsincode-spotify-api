import process from "node:process";
import { afterEach, beforeEach, describe, it } from "mocha";
import { assert, expect, use } from "chai";
import * as td from "testdouble";
import tdChai from "testdouble-chai";
import { HttpRequest, HttpResponse } from "../lib/http.js";
import createMockSocket from "./mocks/socket.js";

// Add the testdouble extension for Chai
use(tdChai(td));

describe("http", () => {
  describe("HttpRequest", () => {
    const HOST = "http://localhost:4000";
    let originalEnv, socket;

    beforeEach(() => {
      socket = createMockSocket();
      originalEnv = { ...process.env };
      process.env["HOST"] = HOST;
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should reveal the cookies in the request", () => {
      const request = new HttpRequest(socket);
      request.headers = { cookie: "foo=bar; id=1234" };

      const cookies = request.cookies;
      assert.isDefined(cookies);
      assert.containsAllKeys(cookies, ["foo", "id"]);
      assert.equal(cookies["foo"], "bar");
      assert.equal(cookies["id"], "1234");
    });

    it("should return an empty object when there are no cookies in the request", () => {
      const request = new HttpRequest(socket);
      request.headers = {};

      const cookies = request.cookies;
      assert.isDefined(cookies);
      assert.lengthOf(Object.keys(cookies), 0);
    });

    it("should reveal the query string parameters", () => {
      const request = new HttpRequest(socket);
      request.url = "/api/user?id=123&timeout=2000";

      const query = request.query;
      assert.isDefined(query);
      assert.containsAllKeys(query, ["timeout", "id"]);
      assert.strictEqual(query["id"], "123");
      assert.strictEqual(query["timeout"], "2000");
    });

    it("should reveal the path name", () => {
      const request = new HttpRequest(socket);
      request.url = "/api/user?id=123&timeout=2000";

      const pathname = request.pathname;
      assert.isDefined(pathname);
      assert.strictEqual(pathname, "/api/user");
    });

    it("should provide access to environment variables", () => {
      const request = new HttpRequest(socket);

      assert.isDefined(request.context.env);
      assert.strictEqual(request.context.env["HOST"], HOST);
    });
  });

  describe("HttpResponse", () => {
    const EMPTY_OPTIONS = {};
    const REDIRECT_LOCATION = "https://accounts.spotify.com";
    let request, socket;

    beforeEach(() => {
      socket = createMockSocket();
      request = new HttpRequest(socket);
    });

    it("should reveal the cookies in the request", () => {
      request.headers = { cookie: "foo=bar; id=1234" };
      const response = new HttpResponse(request, EMPTY_OPTIONS);

      const cookies = response.cookies;
      assert.isDefined(cookies);
      assert.containsAllKeys(cookies, ["foo", "id"]);
      assert.strictEqual(cookies["foo"], "bar");
      assert.strictEqual(cookies["id"], "1234");
    });

    it("should have no cookies when there are no cookies in the request", () => {
      request.headers = {};
      const response = new HttpResponse(request, EMPTY_OPTIONS);

      const cookies = response.cookies;
      assert.isDefined(cookies);
      assert.lengthOf(Object.keys(cookies), 0);
    });

    it("should set additional cookies to cookies present in the request", () => {
      request.headers = {
        cookie: "foo=bar; id=1234",
      };
      const newCookies = [
        ["state", "sleep"],
        ["client", "dreaming"],
      ];
      const response = new HttpResponse(request, EMPTY_OPTIONS);
      response.setCookies(newCookies);

      const cookies = response.cookies;
      assert.strictEqual(cookies["foo"], "bar");
      assert.strictEqual(cookies["id"], "1234");
      assert.strictEqual(cookies["state"], "sleep");
      assert.strictEqual(cookies["client"], "dreaming");
    });

    it("should set the response headers correctly for request cookies and new cookies", () => {
      request.headers = {
        cookie: "foo=bar; id=1234",
      };
      const newCookies = [
        ["state", "sleep"],
        ["client", "dreaming"],
      ];
      const response = new HttpResponse(request, EMPTY_OPTIONS);
      response.setCookies(newCookies);

      const headers = response.getHeaders();
      assert.deepEqual(headers["set-cookie"], ["foo=bar", "id=1234", "state=sleep", "client=dreaming"]);
    });

    it("should not have any headers when there are no cookies to clear", () => {
      request.headers = { cookie: "" };
      const response = new HttpResponse(request, EMPTY_OPTIONS);
      response.clearCookies();

      const headers = response.getHeaders();
      assert.isDefined(headers);
      assert.doesNotHaveAnyKeys(headers, ["set-cookie"]);
    });

    it("should reset each cookie in the request header", () => {
      request.headers = {
        cookie: "foo=bar; id=1234",
      };
      const response = new HttpResponse(request, EMPTY_OPTIONS);
      response.clearCookies();

      const headers = response.getHeaders();
      assert.hasAnyKeys(headers, ["set-cookie"]);
      assert.deepEqual(headers["set-cookie"], ["foo=; Max-Age=0", "id=; Max-Age=0"]);
    });

    it("should clear cookies from the accessor", () => {
      request.headers = {
        cookie: "foo=bar; id=1234",
      };
      const response = new HttpResponse(request, EMPTY_OPTIONS);
      response.clearCookies();

      assert.lengthOf(Object.keys(response.cookies), 0);
    });

    it("should clear only the specified cookie", () => {
      request.headers = {
        cookie: "foo=bar; id=1234",
      };
      const response = new HttpResponse(request, EMPTY_OPTIONS);
      response.clearCookie("foo");

      const headers = response.getHeaders();
      assert.deepEqual(headers["set-cookie"], ["foo=; Max-Age=0", "id=1234"]);
    });

    it("should set the status code to 307 when redirecting", () => {
      const response = new HttpResponse(request, EMPTY_OPTIONS);
      response.writeHead = td.func();
      response.redirect(REDIRECT_LOCATION);
      expect(response.writeHead).to.have.been.calledWith(307);
    });

    it("should set a location for the redirect", () => {
      const captor = td.matchers.captor();
      const response = new HttpResponse(request, EMPTY_OPTIONS);
      response.setHeaders = td.func();

      response.redirect(REDIRECT_LOCATION);
      td.verify(response.setHeaders(captor.capture()));

      expect(response.setHeaders).to.have.been.called;

      const responseHeaders = captor.values[0];
      expect(responseHeaders).to.be.an.instanceof(Map);
      expect(responseHeaders).to.have.any.keys("location");
      expect(responseHeaders.get("location")).to.equal(REDIRECT_LOCATION);
    });

    it("should retain the cookies set before the redirect", () => {
      const captor = td.matchers.captor();
      const response = new HttpResponse(request, EMPTY_OPTIONS);
      response.setCookie("foo", "bar");
      response.setHeaders = td.func();

      response.redirect(REDIRECT_LOCATION);
      td.verify(response.setHeaders(captor.capture()));

      const responseHeaders = captor.values[0];
      expect(responseHeaders).to.be.an.instanceof(Map);
      expect(responseHeaders).to.have.any.keys("set-cookie");
      expect(responseHeaders.get("set-cookie")).to.deep.equal(["foo=bar"]);
    });

    it("should close the response", () => {
      const response = new HttpResponse(request, EMPTY_OPTIONS);
      response.end = td.func();

      response.redirect(REDIRECT_LOCATION);

      expect(response.end).to.have.been.called;
    });
  });
});
