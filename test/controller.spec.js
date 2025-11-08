import { afterEach, beforeEach, describe, it } from "mocha";
import { expect, use } from "chai";
import * as td from "testdouble";
import tdChai from "testdouble-chai";

// Add the testdouble extension for Chai
use(tdChai(td));

const SPOTIFY_CLIENT_ID = "spotify-client-id";

describe("controller", () => {
  describe("#handleLoginRequest", () => {
    const REDIRECT_URI = "http://localhost:4000";
    const HEADERS = {};

    let response, utilModule, module, originalEnv;

    beforeEach(async () => {
      utilModule = await td.replaceEsm("../lib/util.js");
      td.when(utilModule.generateRandomString()).thenReturn("ABCDEFGHIJ");

      module = await import("../lib/controller.js");
      response = td.object(["setHeaders", "writeHead", "end"]);

      originalEnv = { ...process.env };
      process.env["SPOTIFY_CLIENT_ID"] = SPOTIFY_CLIENT_ID;
    });

    afterEach(() => {
      process.env = originalEnv;
      td.reset();
    });

    it("should set a redirect http status", () => {
      module.handleLoginRequest(response, HEADERS, REDIRECT_URI);
      expect(response.writeHead).to.have.been.calledWith(307);
    });

    it("should set a location for the redirect", () => {
      const captor = td.matchers.captor();

      module.handleLoginRequest(response, HEADERS, REDIRECT_URI);
      td.verify(response.setHeaders(captor.capture()));

      expect(response.setHeaders).to.have.been.called;

      const responseHeaders = captor.values[0];
      expect(responseHeaders).to.be.an.instanceof(Map);
      expect(responseHeaders).to.have.any.keys("Location");

      const locationHeader = responseHeaders.get("Location");
      expect(locationHeader).to.include("accounts.spotify.com/authorize");
    });

    it("should set the return URI for the Spotify API call", () => {
      const captor = td.matchers.captor();

      module.handleLoginRequest(response, HEADERS, REDIRECT_URI);
      td.verify(response.setHeaders(captor.capture()));

      const responseHeaders = captor.values[0];
      const locationHeader = responseHeaders.get("Location");

      const url = new URL(locationHeader);
      expect(url.searchParams.has("redirect_uri")).to.be.true;
      expect(url.searchParams.get("redirect_uri")).to.equal(REDIRECT_URI);
    });

    it("should set the Spotify Client ID for the Spotify API call", () => {
      const captor = td.matchers.captor();

      module.handleLoginRequest(response, HEADERS, REDIRECT_URI);
      td.verify(response.setHeaders(captor.capture()));

      const responseHeaders = captor.values[0];
      const locationHeader = responseHeaders.get("Location");

      const url = new URL(locationHeader);
      expect(url.searchParams.has("client_id")).to.be.true;
      expect(url.searchParams.get("client_id")).to.equal(SPOTIFY_CLIENT_ID);
    });

    it("should set a state cookie", () => {
      const captor = td.matchers.captor();

      module.handleLoginRequest(response, HEADERS, REDIRECT_URI);
      td.verify(response.setHeaders(captor.capture()));

      const responseHeaders = captor.values[0];
      const cookieHeader = responseHeaders.get("Set-Cookie");
      expect(cookieHeader).to.include(`=ABCDEFGHIJ`);
    });

    it("should close the response", () => {
      module.handleLoginRequest(response, HEADERS, REDIRECT_URI);
      expect(response.end).to.have.been.called;
    });
  });
});
