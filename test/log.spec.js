import { afterEach, beforeEach, describe, it } from "mocha";
import { expect, use } from "chai";
import * as td from "testdouble";
import tdChai from "testdouble-chai";

// Add the testdouble extension for Chai
use(tdChai(td));

describe("log", function () {
  let nodeFs, module;

  beforeEach(async () => {
    nodeFs = await td.replaceEsm("node:fs");
    module = await import("../lib/log.js");
  });

  afterEach(() => {
    td.reset();
  });

  describe("#getLogger", () => {
    it("should return the logger", () => {
      const logger = module.default();
      expect(logger).not.to.be.undefined;
      expect(logger).not.to.be.null;
    });
  });

  describe("Logger#constructor", () => {
    it("should create the directory when it is not present", () => {
      td.when(nodeFs.existsSync(td.matchers.isA(String))).thenReturn(false);

      module.default();

      expect(nodeFs.existsSync).to.have.been.called;
      td.verify(nodeFs.existsSync(td.matchers.contains("data")));
      expect(nodeFs.mkdirSync).to.have.been.called;
    });

    it("should scan files in the directory when it is present", () => {
      td.when(nodeFs.existsSync(td.matchers.isA(String))).thenReturn(true);
      td.when(nodeFs.readdirSync(td.matchers.isA(String))).thenReturn(["file.log"]);

      module.default();

      expect(nodeFs.readdirSync).to.have.been.called;
      td.verify(nodeFs.readdirSync(td.matchers.contains("data")));
    });
  });

  describe("Logger#request", () => {
    let requestUrl, requestHeaders;

    beforeEach(() => {
      requestUrl = new URL("login", "https://spotify.travelsincode.com");
      requestHeaders = {
        accepts: "*",
      };
      td.when(nodeFs.existsSync(td.matchers.contains("data"))).thenReturn(true);
    });

    it("should create the first log file", () => {
      td.when(nodeFs.readdirSync(td.matchers.isA(String))).thenReturn(["data.json"]);
      td.when(nodeFs.existsSync(td.matchers.contains(".log"))).thenReturn(false);
      const captor = td.matchers.captor();

      const logger = module.default();

      logger.request(requestUrl, requestHeaders);
      td.verify(nodeFs.writeFileSync(captor.capture(), td.matchers.isA(String), td.matchers.isA(Object)));

      expect(captor.values[0]).to.contain("app-00.log");
    });

    it("should write out the log entry with request data", () => {
      td.when(nodeFs.readdirSync(td.matchers.isA(String))).thenReturn(["data.json"]);
      td.when(nodeFs.existsSync(td.matchers.contains(".log"))).thenReturn(false);
      const captor = td.matchers.captor();

      const logger = module.default();
      logger.request(requestUrl, requestHeaders);
      td.verify(nodeFs.writeFileSync(td.matchers.isA(String), captor.capture(), td.matchers.isA(Object)));

      const logEntry = captor.values[0];
      expect(logEntry).to.contain("REQUEST: ");
      expect(logEntry).to.contain(requestUrl.hostname);
      expect(logEntry).to.contain("accepts");
    });

    it("should write out the log entry with the port number for the request", () => {
      td.when(nodeFs.readdirSync(td.matchers.isA(String))).thenReturn([]);
      td.when(nodeFs.existsSync(td.matchers.contains(".log"))).thenReturn(false);
      const captor = td.matchers.captor();

      const urlWithPort = new URL(`${requestUrl.origin}:8443`);
      const logger = module.default();
      logger.request(urlWithPort, requestHeaders);
      td.verify(nodeFs.writeFileSync(td.matchers.isA(String), captor.capture(), td.matchers.isA(Object)));

      const logEntry = captor.values[0];
      expect(logEntry).to.contain('"port":"8443"');
    });

    it("should write out the log entry with the query string parameters with the request", () => {
      td.when(nodeFs.readdirSync(td.matchers.isA(String))).thenReturn([]);
      td.when(nodeFs.existsSync(td.matchers.contains(".log"))).thenReturn(false);
      const captor = td.matchers.captor();

      requestUrl.searchParams.set("foo", "bar");
      requestUrl.searchParams.set("baz", "123");
      const logger = module.default();
      logger.request(requestUrl, requestHeaders);
      td.verify(nodeFs.writeFileSync(td.matchers.isA(String), captor.capture(), td.matchers.isA(Object)));

      const logEntry = captor.values[0];
      expect(logEntry).to.contain('"query":{"foo":"bar","baz":"123"}');
    });

    it("should append to an existing log file", () => {
      td.when(nodeFs.readdirSync(td.matchers.isA(String))).thenReturn(["data.json", "file.log"]);
      td.when(nodeFs.statSync(td.matchers.contains(".log"))).thenReturn({
        isFile() {
          return true;
        },
        size: 1024,
      });

      const logger = module.default();
      logger.request(requestUrl, requestHeaders);

      expect(nodeFs.appendFileSync).to.have.been.called;
    });

    it("should write to a log file with an index of 10 or greater in the name", () => {
      td.when(nodeFs.readdirSync(td.matchers.isA(String))).thenReturn(
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `app-0${n}.log`)
      );
      td.when(nodeFs.statSync(td.matchers.contains(".log"))).thenReturn({
        isFile() {
          return true;
        },
        size: 1.2e6,
      });
      const captor = td.matchers.captor();

      const logger = module.default();
      logger.request(requestUrl, requestHeaders);

      td.verify(nodeFs.writeFileSync(captor.capture(), td.matchers.isA(String), td.matchers.isA(Object)));

      expect(captor.values[0]).to.contain("app-10.log");
    });

    it("should create a new log file when the last one is too big", () => {
      td.when(nodeFs.readdirSync(td.matchers.isA(String))).thenReturn(["data.json", "file.log"]);
      td.when(nodeFs.existsSync(td.matchers.contains(".log"))).thenReturn(true);
      td.when(nodeFs.statSync(td.matchers.contains(".log"))).thenReturn({
        isFile() {
          return true;
        },
        size: 1.1e6,
      });
      const captor = td.matchers.captor();

      const logger = module.default();
      logger.request(requestUrl, requestHeaders);

      td.verify(nodeFs.writeFileSync(captor.capture(), td.matchers.isA(String), td.matchers.isA(Object)));

      expect(captor.values[0]).to.contain("app-01.log");
    });
  });

  describe("Logger#info", () => {
    it("should write an INFO log entry", () => {
      td.when(nodeFs.readdirSync(td.matchers.isA(String))).thenReturn(["file.log"]);
      td.when(nodeFs.existsSync(td.matchers.contains(".log"))).thenReturn(false);
      const captor = td.matchers.captor();

      const logger = module.default();
      logger.info("This is information");
      td.verify(nodeFs.writeFileSync(td.matchers.isA(String), captor.capture(), td.matchers.isA(Object)));

      const logEntry = captor.values[0];
      expect(logEntry).to.match(/\[[^]+]/); // Timestamp
      expect(logEntry).to.contain("INFO   : ");
      expect(logEntry).to.contain("This is information");
    });
  });

  describe("Logger#error", () => {
    it("should write an ERROR log entry", () => {
      td.when(nodeFs.readdirSync(td.matchers.isA(String))).thenReturn(["file.log"]);
      td.when(nodeFs.existsSync(td.matchers.contains(".log"))).thenReturn(false);
      const captor = td.matchers.captor();

      const logger = module.default();
      logger.error("This is an error");
      td.verify(nodeFs.writeFileSync(td.matchers.isA(String), captor.capture(), td.matchers.isA(Object)));

      const logEntry = captor.values[0];
      expect(logEntry).to.match(/\[[^]+]/); // Timestamp
      expect(logEntry).to.contain("ERROR  : ");
      expect(logEntry).to.contain("This is an error");
    });
  });
});
