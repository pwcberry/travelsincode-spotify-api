import { appendFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

let logger = null;

const getTimestamp = () => {
  const now = new Date();
  return (
    `${now.getFullYear().toString()}-` +
    `${(now.getMonth() + 1).toString().padStart(2, "0")}-` +
    `${now.getDate().toString().padStart(2, "0")} ` +
    `${now.getHours().toString().padStart(2, "0")}:` +
    `${now.getMinutes().toString().padStart(2, "0")}:` +
    now.getSeconds().toString().padStart(2, "0")
  );
};

const getTime = () => {
  const now = new Date();
  return (
    `${now.getHours().toString().padStart(2, "0")}:` +
    `${now.getMinutes().toString().padStart(2, "0")}:` +
    now.getSeconds().toString().padStart(2, "0")
  );
};

function getFileStats(path) {
  const stats = existsSync(path)
    ? statSync(path)
    : {
        isFile() {
          return false;
        },
        size: 0,
      };
  return {
    path,
    isFile: stats.isFile(),
    isUnderBudget: stats.size < 1e6,
  };
}

class Logger {
  #directoryPath;
  #directoryExists = false;
  #logIndex = -1;

  constructor() {
    this.#directoryPath = join(import.meta.dirname, "../data");
    this.#checkDir();
  }

  request(requestUrl, requestHeaders) {
    const url = {
      host: requestUrl.hostname,
      path: requestUrl.pathname,
    };

    if (requestUrl.searchParams.size > 0) {
      url.query = requestUrl.searchParams.entries().reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
    }

    if (requestUrl.port) {
      url.port = requestUrl.port;
    }

    this.#write("REQUEST: " + JSON.stringify({ url, requestHeaders }));
  }

  info(message) {
    this.#write(`INFO   : ${message}`);
  }

  error(message) {
    this.#write(`ERROR  : ${message}`);
  }

  #write(message) {
    const logEntry = `[${getTimestamp()}] - ${message}\n`;
    const stats = getFileStats(this.#getLogFilePath());

    if (!stats.isFile) {
      writeFileSync(this.#getLogFilePath(), logEntry, { encoding: "utf8" });
    } else if (!stats.isUnderBudget) {
      this.#logIndex += 1;
      writeFileSync(this.#getLogFilePath(), logEntry, { encoding: "utf8" });
    } else {
      appendFileSync(this.#getLogFilePath(), logEntry, { encoding: "utf8" });
    }

    if (process.env["MODE"] !== "TEST") {
      process.stdout.write(`[${getTime()}] - ${message}\n`);
    }
  }

  #getLogFilePath() {
    return join(this.#directoryPath, `app-${this.#logIndex.toString().padStart(2, "0")}.log`);
  }

  #checkDir() {
    this.#directoryExists = existsSync(this.#directoryPath);

    if (!this.#directoryExists) {
      mkdirSync(this.#directoryPath);
      this.#directoryExists = true;
    } else {
      const fileCount = readdirSync(this.#directoryPath).filter((file) => file.endsWith(".log")).length;
      if (this.#logIndex === -1) {
        // Start a new log file when this class is instantiated
        this.#logIndex = fileCount > 0 ? fileCount - 1 : 0;
      }
    }
  }
}

export default function () {
  if (!logger) {
    logger = new Logger();
  }
  return logger;
}
