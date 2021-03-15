const { error } = require("./logger");

module.exports = applyCustomHeader = (
  content,
  log,
  nextUpdate,
  version,
  usePlainText,
  tail_lines
) => {
  let versionString = version === "UNDEFINED" ? version : "v" + version;
  let sourceInfo;
  switch (log.source.type) {
    case "command":
      sourceInfo = "(Executing) " + log.source.resource;
      break;

    case "file":
      sourceInfo = "(Reading) " + log.source.resource;
      break;

    default:
      error("Couldn't resolve type", log.source.type);
      break;
  }
  let tailinfo = "";
  if (tail_lines) {
    tailinfo = `(Only showing the last ${tail_lines} lines of the command, because it returned to much.)`;
  }

  if (usePlainText) {
    return buildPlainTextHeader(
      versionString,
      log.name,
      sourceInfo,
      nextUpdate,
      tailinfo,
      content
    );
  } else {
    return buildHTMLHeader(
      versionString,
      log.name,
      sourceInfo,
      nextUpdate,
      tailinfo,
      content
    );
  }
};

function buildHTMLHeader(
  versionString,
  logname,
  sourceInfo,
  nextUpdate,
  tailinfo,
  content
) {
  return insertContentIntoHTMLBoilerPlate(
    logname,
    `
███╗░░██╗███████╗░██╗░░░░░░░██╗</br>
████╗░██║██╔════╝░██║░░██╗░░██║</br>
██╔██╗██║█████╗░░░╚██╗████╗██╔╝</br>
██║╚████║██╔══╝░░░░████╔═████║░</br>
██║░╚███║███████╗░░╚██╔╝░╚██╔╝░</br>
╚═╝░░╚══╝╚══════╝░░░╚═╝░░░╚═╝░░</br>
<p>
  <a href='https://github.com/open-schnick/NotEnoughWood/'>NotEnoughWood ${versionString}</a></br>
  Created by <a href='https://github.com/open-schnick/'>open-schnick</a>
</p>
--------------------------------------</br>
<b>Logfile:</b> <em>${logname}.log</em></br>
<b>Source:</b> <em>${sourceInfo}</em></br>
${getUpdateMessage(nextUpdate)}</br>
--------------------------------------</br>
<i>${tailinfo}</i></br>
<pre style='word-wrap: break-word; white-space: pre-wrap;'>
${content}
</pre>`
  );
}

function buildPlainTextHeader(
  versionString,
  logname,
  sourceInfo,
  nextUpdate,
  tailinfo,
  content
) {
  return `
███╗░░██╗███████╗░██╗░░░░░░░██╗
████╗░██║██╔════╝░██║░░██╗░░██║ 
██╔██╗██║█████╗░░░╚██╗████╗██╔╝ 
██║╚████║██╔══╝░░░░████╔═████║░ 
██║░╚███║███████╗░░╚██╔╝░╚██╔╝░ 
╚═╝░░╚══╝╚══════╝░░░╚═╝░░░╚═╝░░ 
NotEnoughWood ${versionString}
Created by open-schnick 
-------------------------------------- 
Logfile: ${logname}.log 
Source: ${sourceInfo} 
${getUpdateMessage(nextUpdate)}
-------------------------------------- 
${tailinfo}

${content}`;
}

function insertContentIntoHTMLBoilerPlate(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | NotEnoughWood</title>
  </head>
  <body>
      ${content}
  </body>
</html>`;
}

function getUpdateMessage(duration) {
  if (duration === NaN || duration === null || duration === undefined) {
    return "Caching is disabled for this command.";
  }
  duration = (duration - Date.now()) / 1000; // is in millis
  // props to https://stackoverflow.com/questions/36098913/convert-seconds-to-days-hours-minutes-and-seconds
  var d = Math.floor(duration / (3600 * 24));
  var h = Math.floor((duration % (3600 * 24)) / 3600);
  var m = Math.floor((duration % 3600) / 60);
  var s = Math.floor(duration % 60);

  var dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
  return "Next update in " + dDisplay + hDisplay + mDisplay + sDisplay;
}
