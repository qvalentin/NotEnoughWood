#!/usr/bin/env node
"use strict";
const meow = require("meow");
const newApp = require("../newApp");

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

Necessary arguements:
  --config, -c  specify the config path
  
Options
  --port, -p    specify the port
  --folder, -f  specify the folder containing the logs. (By default the current working directory)

Examples
  $ new --port 3000
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
    },
  }
);

newApp(cli.flags);
