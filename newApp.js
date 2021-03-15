const handler = require("serve-handler");
const auth = require("basic-auth");
const express = require("express");
const fs = require("fs");
const path = require("path");
const { exit } = require("process");

// custom stuff
const { initLogger, info, warn, error } = require("./lib/logger");
const { getLogs } = require("./lib/cacheHandler");
const applyCustomHeader = require("./lib/customHeader");

function newApp(flags) {
  process.title = "NotEnoughWood";
  const app = express();

  // init logger
  let loggerIsSilent = flags.silent !== undefined;
  let loggerIsInDebug = flags.debug !== undefined;
  initLogger(loggerIsSilent, loggerIsInDebug);

  // handle args
  let port = 4200;
  let configPath;
  let folderPath = "";

  if (flags.port != undefined) {
    port = flags.port;
  }
  if (flags.config != undefined) {
    configPath = flags.config;
  }
  if (flags.folder != undefined) {
    folderPath = flags.folder;
  }

  // handle version
  const version = getVersion();

  // config
  let configJson = null;

  app.use((req, res, next) => {
    if (
      configJson &&
      configJson.authentication &&
      configJson.authentication.enabled
    ) {
      let credentials = auth(req);

      // Check credentials
      if (
        !credentials ||
        !check(credentials.name, credentials.pass, configJson)
      ) {
        res.statusCode = 401;
        res.setHeader("WWW-Authenticate", "Basic realm='NEWloggerRealm'");
        res.end("Access denied");
      } else {
        next();
      }
    } else {
      next();
    }
  });

  app.get("*", (req, res) => {
    if (req.url.includes(".log")) {
      let foundFileName = req.url.split("/");
      if (foundFileName.length != 2) {
        warn("did not find foundFileName:", foundFileName);
        res.sendStatus(404);
      } else {
        //split .log
        foundFileName = foundFileName[1];
        foundFileName = foundFileName.split(".log")[0];
        foundFileName = decodeURIComponent(foundFileName);

        // compare with logs
        let logs = configJson.logs;
        logs = logs.filter((l) => l.name === foundFileName);
        if (logs != null && logs.length == 1) {
          currentLog = logs[0];
          if (currentLog.source != null) {
            // check user agent to enable / disable html support for the header.
            const usePlainText = userWantsPlainTextOrComesFromCurl(req); // this does return true or null

            getLogs(
              currentLog,
              currentLog.cachingEnabled,
              configJson.defaultCachingTime
            )
              .then(({ content, nextUpdate, tail_lines }) => {
                content = applyCustomHeader(
                  content,
                  currentLog,
                  nextUpdate,
                  version,
                  usePlainText,
                  tail_lines
                );
                res.status(200).send(content);
              })
              .catch((err) => {
                error(
                  "Encountered Exception while displaying",
                  currentLog.name,
                  err
                );
                if (err) {
                  res
                    .status(500)
                    .send(
                      "Encountered Exception while displaying<b> " +
                        currentLog.name +
                        "</b></br>" +
                        err
                    );
                } else {
                  res
                    .status(500)
                    .send(
                      "Encountered Exception while displaying<b> " +
                        currentLog.name +
                        "</b></br>" +
                        err
                    );
                }
              });
          } else {
            res.status(404).send("No source for log in config specified.");
          }
        } else {
          res.status(404).send("Could't find a logfile with this name.");
        }
      }
    } else {
      handler(req, res, {
        public: path.join(folderPath, configJson.virtualFolderName),
      });
    }
  });

  app.listen(port, () => {
    // read config.
    try {
      configJson = JSON.parse(fs.readFileSync(configPath, "utf-8"));

      if (
        configJson.virtualFolderName === null ||
        configJson.virtualFolderName === undefined
      ) {
        error("virtualFolderName was not valid!");
        error("Exiting...");
        exit(1);
      }
    } catch (err) {
      error("Config was not valid!", err);
      error("Exiting...");
      exit(1);
    }

    // create fake folder
    if (!fs.existsSync(path.join(folderPath, configJson.virtualFolderName))) {
      fs.mkdir(path.join(folderPath, configJson.virtualFolderName), (err) =>
        err ? warn("Couldn't create folder:", err) : null
      );
    }

    // create fake logfiles
    if (configJson.logs && configJson.logs.length != null) {
      configJson.logs.forEach((log) => {
        // this does overwrite!
        fs.writeFileSync(
          path.join(
            folderPath,
            configJson.virtualFolderName,
            log.name + ".log"
          ),
          "If you are seeing this, something fishy happend."
        );
      });
    }
    info("Started on: http://localhost:" + port);
  });
}

function getVersion() {
  // get version
  let foundVersion = "UNKOWN";
  try {
    const json = fs.readFileSync(path.join(__dirname, "./package.json"));
    const possibleVersion = JSON.parse(json).version;
    foundVersion = possibleVersion ? possibleVersion : foundVersion;
  } catch (error) {
    warn("Couln't find the package.json file.");
    warn("This might break something.");
  }
  return foundVersion;
}

function check(name, pass, configJson) {
  var valid = true;

  valid = name === configJson.authentication.username && valid;
  valid = pass === configJson.authentication.password && valid;

  return valid;
}

/**
 * Insecure way to check if the request comes from a curl user agent, or if the param is 'plain=true'. DO NOT USE THIS FOR SECURITY RELEVANT CODE.
 * @param {*} req
 */
function userWantsPlainTextOrComesFromCurl(req) {
  const userAgent = req.headers["user-agent"];
  const userAgentIsCurl = userAgent.startsWith("curl/");
  const userRequestedIt = req.query.plain === "true";
  return userAgentIsCurl || userRequestedIt;
}

module.exports = newApp;
