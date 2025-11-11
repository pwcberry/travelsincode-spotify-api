import process from "node:process";
import { afterEach, beforeEach, describe, it } from "mocha";
import { expect, use } from "chai";
import * as td from "testdouble";
import tdChai from "testdouble-chai";
import { HttpRequest } from "../lib/http.js";

// Add the testdouble extension for Chai
use(tdChai(td));

const SPOTIFY_CLIENT_ID = "spotify-client-id";
const REDIRECT_URI = "http://localhost:4000";

describe("controller", () => {
  describe("#handleLoginRequest", () => {
    let request, response, utilModule, module, originalEnv;

    beforeEach(async () => {
      originalEnv = { ...process.env };
      process.env[""] = REDIRECT_URI;
      process.env["SPOTIFY_CLIENT_ID"] = SPOTIFY_CLIENT_ID;

      // The request object doesn't need to be mocked
      request = new HttpRequest({});

      // We need to check the controller does use the response methods
      response = td.object(["redirect", "setCookie"]);

      utilModule = await td.replaceEsm("../lib/util.js");
      td.when(utilModule.generateRandomString()).thenReturn("ABCDEFGHIJ");

      module = await import("../lib/controller.js");
    });

    afterEach(() => {
      process.env = originalEnv;
      td.reset();
    });

    it("should set a location for the redirect", () => {
      const captor = td.matchers.captor();

      module.handleLoginRequest(request, response, REDIRECT_URI);
      td.verify(response.redirect(captor.capture()));

      expect(response.redirect).to.have.been.called;
      const redirectLocation = captor.values[0];
      expect(redirectLocation).to.be.an.instanceOf(URL);
      expect(redirectLocation.toString()).to.include("accounts.spotify.com/authorize");
    });

    it("should set the return URI for the Spotify API call", () => {
      const captor = td.matchers.captor();

      module.handleLoginRequest(request, response, REDIRECT_URI);
      td.verify(response.redirect(captor.capture()));

      const redirectLocation = captor.values[0];
      expect(redirectLocation.searchParams.has("redirect_uri")).to.be.true;
      expect(redirectLocation.searchParams.get("redirect_uri")).to.equal(REDIRECT_URI);
    });

    it("should set the Spotify Client ID for the Spotify API call", () => {
      const captor = td.matchers.captor();

      module.handleLoginRequest(request, response, REDIRECT_URI);
      td.verify(response.redirect(captor.capture()));

      const redirectLocation = captor.values[0];
      expect(redirectLocation.searchParams.has("client_id")).to.be.true;
      expect(redirectLocation.searchParams.get("client_id")).to.equal(SPOTIFY_CLIENT_ID);
    });

    it("should set a state cookie", () => {
      const captor = td.matchers.captor();

      module.handleLoginRequest(request, response, REDIRECT_URI);
      td.verify(response.setCookie(captor.capture(), captor.capture()));

      expect(response.setCookie).to.have.been.called;

      const [key, value] = [captor.values[0], captor.values[1]];
      expect(key).to.equal("spotify_auth_state");
      expect(value).to.equal("ABCDEFGHIJ");
    });
  });
});
