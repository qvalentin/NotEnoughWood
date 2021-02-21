const handler = require("serve-handler");
const express = require("express");
const fs = require("fs");

// custom stuff
const logger = require("./lib/logger");
const { exit } = require("process");

const app = express();
const port = 4200;

// config
let configJson = null;

/*app.use((req, res) => {
  handler(req, res)
    .then((res) => {
      console.log("res " + res);
    })
    .catch((err) => console.log(err));
  return "no";
});
*/

app.get("*", (req, res) => {
  // check authentication.
  logger("got request.");
  handler(req, res, { public: configJson.virtualFolderName });
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
      err ? logger("Couldn't create folder: " + err) : null
    );
  }

  logger("Server started on: http://localhost:" + port);
});
