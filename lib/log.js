import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

let logger = null;

const checkDirSync = () => {
  let dirCreated;
};

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
    isFile: stats.isFile(),
    isUnderBudget: stats.size < 1e6,
  };
}

class Logger {
  #directoryPath;
  #directoryExists = false;
  #logIndex = -1;

  constructor(logDirName) {
    this.#directoryPath = join(import.meta.dirname, logDirName);
  }

  request() {}

  info(message) {}

  error(message) {}

  #write(message) {
    this.#checkDir();
  }

  #checkDir() {
    if (!this.#directoryExists) {
      this.#directoryExists = existsSync(this.#directoryPath);
      mkdirSync(this.#directoryPath);
    }
    const fileCount = readdirSync(this.#directoryPath).filter((file) => file.endsWith(".log")).length;
    if (this.#logIndex === -1) {
      this.#logIndex = fileCount - 1;
    }
  }
}

// TODO: Create logger
function logRequest(logDirectory, requestUrl, requestBody, responseBody, statusCode) {
  const logFullDirectory = join(process.cwd(), logDirectory);
  const fileCount = checkDir(logFullDirectory);

  const logEntry = JSON.stringify({
    request: {
      host: requestUrl.hostname,
      path: requestUrl.pathname,
      port: requestUrl.port,
    },
    requestBody,
    responseBody,
    statusCode,
    timestamp,
  });

  let logIndex = fileCount > 0 ? fileCount.toString().padStart(4, "0") : "0001";
  let logFilePath = join(logFullDirectory, `requests-${logIndex}.log`);
  const stats = getFileStats(logFilePath);

  if (!stats.isFile) {
    writeFileSync(logFilePath, logEntry + "\n", { encoding: "utf8" });
  } else if (!stats.isUnderBudget) {
    logIndex = (parseInt(logIndex) + 1).toString().padStart(4, "0");
    logFilePath = join(logFullDirectory, `requests-${logIndex}.log`);
    writeFileSync(logFilePath, logEntry + "\n", { encoding: "utf8" });
  } else {
    appendFileSync(logFilePath, logEntry + "\n", { encoding: "utf8" });
  }
}

export default function () {
  if (!logger) {
    logger = new Logger(join(import.meta.dirname, "data"));
  }
  return logger;
}
