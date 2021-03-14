module.exports = applyCustomHeader = (
  content,
  filename,
  command,
  nextupdate,
  version
) => {
  return (
    "███╗░░██╗███████╗░██╗░░░░░░░██╗\n" +
    "████╗░██║██╔════╝░██║░░██╗░░██║\n" +
    "██╔██╗██║█████╗░░░╚██╗████╗██╔╝\n" +
    "██║╚████║██╔══╝░░░░████╔═████║░\n" +
    "██║░╚███║███████╗░░╚██╔╝░╚██╔╝░\n" +
    "╚═╝░░╚══╝╚══════╝░░░╚═╝░░░╚═╝░░\n" +
    "<p><a href='https://github.com/open-schnick/NotEnoughWood/'>NotEnoughWood v" +
    version +
    "</a></br>" +
    "Created by <a href='https://github.com/open-schnick/'>open-schnick</a></p>" +
    "--------------------------------------\n" +
    "<b>Logfile:</b> <em>" +
    filename +
    ".log</em></br>" +
    "<b>Command:</b> " +
    "<em>" +
    command +
    "</em>" +
    "</br>" +
    getUpdateMessage(nextupdate) +
    "</br>--------------------------------------</br></br>" +
    content
  );
};

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
