module.exports = applyCustomHeader = (
  content,
  filename,
  command,
  nextupdate
) => {
  return (
    "███╗░░██╗███████╗░██╗░░░░░░░██╗\n" +
    "████╗░██║██╔════╝░██║░░██╗░░██║\n" +
    "██╔██╗██║█████╗░░░╚██╗████╗██╔╝\n" +
    "██║╚████║██╔══╝░░░░████╔═████║░\n" +
    "██║░╚███║███████╗░░╚██╔╝░╚██╔╝░\n" +
    "╚═╝░░╚══╝╚══════╝░░░╚═╝░░░╚═╝░░\n\n" +
    "NotEnoughWood v1.0\n" +
    "Created by open-schnick\n\n" +
    "--------------------------------------\n" +
    "Logfile: " +
    filename +
    ".log\n" +
    "Command: " +
    command +
    "\n" +
    getUpdateMessage(nextupdate) +
    "\n--------------------------------------\n\n" +
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
