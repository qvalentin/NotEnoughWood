#!/usr/bin/env node
"use strict";
const fs = require("fs");
const meow = require("meow");
const path = require("path");
const newApp = require("../newApp");
const { warn } = require("../lib/logger");

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
  --port, -p    specify the port.
  --folder, -f  specify the folder containing the logs. (By default the current working directory)
  --silent, -s  turn of own log messages to stout.
  --debug, -d   turn on debug log messages.

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
      debug: {
        type: "string",
        alias: "-d",
      },
    },
  }
);

newApp(cli.flags);
