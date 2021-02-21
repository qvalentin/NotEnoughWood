const handler = require("serve-handler");
const express = require("express");
const fs = require("fs");
const path = require("path");
const { exit } = require("process");
const { exec } = require("child_process");

// custom stuff
const logger = require("./lib/logger");

const app = express();
const port = 4200;

// config
let configJson = null;

app.get("*", (req, res) => {
  // check authentication.
  if (req.url.includes(".log")) {
    let foundFileName = req.url.split("/");
    if (foundFileName.length != 2) {
      logger("did not find foundFileName:", foundFileName);
      res.sendStatus(404);
    } else {
      //split .log
      foundFileName = foundFileName[1];
      foundFileName = foundFileName.split(".log");

      // compare with logs
      let logs = configJson.logs;
      logs = logs.filter((l) => l.name === foundFileName[0]);
      if (logs != null && logs.length == 1) {
        // check cache
        // execute command
        currentLog = logs[0];
        logger("foundCommand", currentLog.name);
        if (currentLog.command != null && currentLog.command !== "")
          exec(currentLog.command, (err, stdout, stderr) => {
            if (err == null) {
              res.status(200).send(stdout);
            } else {
              logger(
                "Encountered Exception while executing ",
                currentLog.command
              );
              logger(err, stderr);
              res
                .status(500)
                .send(
                  "Encountered Exception while executing <b>" +
                    currentLog.command +
                    "</b></br>" +
                    err
                );
            }
          });
      } else {
        res.status(404).send("Could't find a logfile with this name");
      }
    }
  } else {
    handler(req, res, { public: configJson.virtualFolderName });
  }
});

app.listen(port, () => {
  // read config.
  try {
    configJson = JSON.parse(fs.readFileSync("config.json", "utf-8"));

    if (
      configJson.virtualFolderName === null ||
      configJson.virtualFolderName === undefined
    ) {
      logger("virtualFolderName was not valid!");
      logger("Exiting...");
      exit(1);
    }
  } catch (error) {
    logger("Config was not valid!");
    logger("Exiting...");
    exit(1);
  }

  // create fake folder
  if (!fs.existsSync(configJson.virtualFolderName)) {
    fs.mkdir(configJson.virtualFolderName, (err) =>
      err ? logger("Couldn't create folder:", err) : null
    );
  }

  // create fake logfiles
  if (configJson.logs && configJson.logs.length != null) {
    configJson.logs.forEach((log) => {
      // this does overwrite!
      fs.writeFileSync(
        path.join(configJson.virtualFolderName, log.name + ".log"),
        "If you see this something fishy happend."
      );
    });
  }
  logger("Server started on: http://localhost:", port);
});
