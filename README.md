# NotEnoughWood - NEW

[![npm](https://img.shields.io/npm/v/new-log?label=version&logo=npm)](https://www.npmjs.com/package/new-log)
[![npm bundle size](https://img.shields.io/bundlephobia/min/new-log?logo=npm)](https://bundlephobia.com/result?p=new-log)

NotEnoughWood - A simple way to access your logs via http/s.  
Show the results of commands in the web. No need for a ssh session to check the log files.

## Features

- Access the logs of commands, like `docker logs <container-name>`.
- If the logs are written to disk, you can host these logfiles.
- Use `cURL` to access the service, or add the `plain` query to the url to show the result without html. Like `http://localhost:4200/test.log?plain=true`
- Use the query param `tail` you can specify the lines (from the ending) you want to see. Something Like `http://localhost:4200/test.log?tail=10` means seeing the last 10 lines of the command output.

```shell script
███╗░░██╗███████╗░██╗░░░░░░░██╗
████╗░██║██╔════╝░██║░░██╗░░██║
██╔██╗██║█████╗░░░╚██╗████╗██╔╝
██║╚████║██╔══╝░░░░████╔═████║░
██║░╚███║███████╗░░╚██╔╝░╚██╔╝░
╚═╝░░╚══╝╚══════╝░░░╚═╝░░░╚═╝░░
NotEnoughWood <version>
Created by open-schnick

--------------------------------------
Logfile: whoami.log
Source: (Executing) whoami
Next update in 9 seconds
--------------------------------------

open-schnick
```

## Install

Just install new-log globally

```shell script
npm install -g new-log
```

## Usage

```shell script
# new-log --help
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
  $ new-log --port 3000 --config ./config.json --silent
```

### --config

The core work to do to run new is to create a config file</br>
The config file contains various key to configure the service.</br>
You can find a dummy config file [in the repository](https://github.com/open-schnick/NotEnoughWood/blob/master/config.json) or below.

```json
{
  "virtualFolderName": "Not enough wood!",
  "defaultCachingTime": 10,
  "defaultTailLines": 100,
  "faviconPath": "https://www.gnu.org/graphics/heckert_gnu.transp.small.png",
  "authentication": {
    "enabled": true,
    "username": "user",
    "password": "1234"
  },
  "logs": [
    {
      "name": "test",
      "cachingTime": 3600,
      "source": {
        "type": "command",
        "resource": "npm -v"
      }
    },
    {
      "name": "static file",
      "source": {
        "type": "file",
        "resource": "<absolute-path-to-file-here>"
      }
    },
    {
      "name": "caching disabled",
      "cachingEnabled": false,
      "source": {
        "type": "command",
        "resource": "whoami"
      }
    },
    {
      "name": "log is tailed to 20 lines",
      "tailLines": 20,
      "source": {
        "type": "command",
        "resource": "journalctl"
      }
    },
    {
      "name": "log is tailed to default 100 lines",
      "source": {
        "type": "command",
        "resource": "journalctl"
      }
    }
  ]
}
```

- <b>virtualFolderName</b> - the name of the folder containing the logs. (This will appear in the web interface)
- <b>defaultCachingTime</b> - the default time in seconds to cache log results. (any number)
- <b>faviconPath</b> - sets the favicon of NEW to the result of an valid url. (valid url)
- <b>defaultTailLines</b> - the default amount of lines tailed when the log size is too big. (200k bytes) (any number)
- <b>authentication</b> - require authentication to access the log files.
  - <b>enabled</b> - set to <i>true</i> to require authentication.
  - <b>username & password</b> - credentials to log in.
- <b>logs</b> - log objects need <i>name</i> and <i>command</i> keys, other keys shown are optional. All keys:
  - <b>name</b> - name of the log / log file (any string)
  - <b>tailLines<b> (optional) - amount of lines to tail for if the source returned too much. (200k bytes) (any number)
  - <b>cachingTime</b> (optional) - custom caching time for the log. Also in seconds (any number)
  - <b>cachingEnabled</b> (optional) - en/disble caching for the log. (any boolean)
  - <b>source</b> - a JSON object representing the info about the source of the logs
    - <b>type</b> - a string specifing the type of the log. Avaiable options are <em>file</em> and <em>command</em>.
    - <b>resource</b> - depending on the <em>type</em> above either the command to execute in the shell, or the absolute path to a static file. (any string)

### --port

Specify a custom port for the web interface. Defaults to port 4200.

### --folder

Specify a different directory for the logs (this will contain the folder with the name specified by the <i>virtualFolderName</i> key.

### --silent

Use the --silent / -s flag to disable logging of own logs to stout.

### --debug

When provided NEW does log additional info to stout

### --help

Show a little help message.
