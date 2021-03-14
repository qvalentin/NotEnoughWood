#!/usr/bin/env node
"use strict";
const fs = require("fs");
const meow = require("meow");
const path = require("path");
const newApp = require("../newApp");
const logger = require("../lib/logger");

const cli = meow(
  `
███╗░░██╗███████╗░██╗░░░░░░░██╗
████╗░██║██╔════╝░██║░░██╗░░██║
██╔██╗██║█████╗░░░╚██╗████╗██╔╝
██║╚████║██╔══╝░░░░████╔═████║░
██║░╚███║███████╗░░╚██╔╝░╚██╔╝░
╚═╝░░╚══╝╚══════╝░░░╚═╝░░░╚═╝░░

Usage
  $ new-log <input>

Necessary arguments:
  --config, -c  specify the config path
  
Options
  --port, -p    specify the port
  --folder, -f  specify the folder containing the logs. (By default the current working directory)
  --silent, -s  turn of debug messages

Examples
  $ new-log --port 3000 --config ./config.json -s
`,
  {
    flags: {
      port: {
        type: "number",
        alias: "p",
      },
      folder: {
        type: "string",
        alias: "f",
      },
      config: {
        type: "string",
        alias: "c",
        isRequired: true,
      },
      silent: {
        type: "string",
        alias: "s",
      },
    },
  }
);

// get version
let foundVersion = "UNKOWN";
try {
  const json = fs.readFileSync(path.join(__dirname, "../package.json"));
  const possibleVersion = JSON.parse(json).version;
  foundVersion = possibleVersion ? possibleVersion : foundVersion;
} catch (error) {
  logger("Couln't find the package.json file.");
  logger("This might break something.");
}

newApp(cli.flags, foundVersion);
