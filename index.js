#!/usr/bin/env node
"use strict";
const meow = require("meow");
const newApp = require("./newApp");

const cli = meow(
  `
███╗░░██╗███████╗░██╗░░░░░░░██╗
████╗░██║██╔════╝░██║░░██╗░░██║
██╔██╗██║█████╗░░░╚██╗████╗██╔╝
██║╚████║██╔══╝░░░░████╔═████║░
██║░╚███║███████╗░░╚██╔╝░╚██╔╝░
╚═╝░░╚══╝╚══════╝░░░╚═╝░░░╚═╝░░

	Usage
	  $ new <input>

	Options
	  --port, -p  specify the port

	Examples
	  $ new --port 3000
`,
  {
    flags: {
      port: {
        type: "number",
        alias: "p",
      },
    },
  }
);

newApp(cli.flags);
