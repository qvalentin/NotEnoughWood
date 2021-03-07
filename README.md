# NotEnoughWood - NEW

NotEnoughWood - A simple logger for your commands.  
Show the results of commands in the web. No need for a ssh session to check the log files.

```shell script
███╗░░██╗███████╗░██╗░░░░░░░██╗
████╗░██║██╔════╝░██║░░██╗░░██║
██╔██╗██║█████╗░░░╚██╗████╗██╔╝
██║╚████║██╔══╝░░░░████╔═████║░
██║░╚███║███████╗░░╚██╔╝░╚██╔╝░
╚═╝░░╚══╝╚══════╝░░░╚═╝░░░╚═╝░░
NotEnoughWood v1.0.3
Created by open-schnick

--------------------------------------
Logfile: whoami.log
Command: whoami
Caching is disabled for this command.
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
--port, -p    specify the port
--folder, -f  specify the folder containing the logs. (By default the current working directory)

Examples
$ new-log --port 3000 --config ./config.json
```

### --config

The core work to do to run new is to create a config file</br>
The config file contains various key to configure the service.</br>
A sample config file:

```json
{
  "virtualFolderName": "Not enough wood!",
  "defaultCachingTime": 10,
  "authentication": {
    "enabled": true,
    "username": "user",
    "password": "1234"
  },
  "logs": [
    {
      "name": "test",
      "command": "npm -v",
      "cachingTime": 3600
    },
    {
      "name": "whoami",
      "command": "whoami",
      "cachingEnabled": false
    }
  ]
}
```

- <b>virtualFolderName</b> - the name of the folder containing the logs. (This will appear in the web interface)
- <b>defaultCachingTime</b> - the default time in seconds to cache log results.
- <b>authentication</b> - require authentication to access the log files.
  - <b>enabled</b> - set to true to require authentication.
  - <b>username & password</b> - credentials to log in.
- <b>logs</b> - log objects need <i>name</i> and <i>command</i> keys, other keys shown are optional. All keys:
  - <b>name</b> - name of the log / log file (any string)
  - <b>command</b> - the command to execute in the shell (any string)
  - <b>cachingTime</b> (optional) - custom caching time for the log. Also in seconds (any number)
  - <b>cachingEnabled</b> (optional) - en/disble caching for the log. (any boolean)

### --port

Specify a custom port for the web interface. Defaults to port 4200.

### --folder

Specify a different directory for the logs (this will contain the folder with the name specified by the <i>virtualFolderName</i> key.

### --help

Show a little help message.
