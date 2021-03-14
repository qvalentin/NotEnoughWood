const infoPrefix = "[INFO] ";
const warnPrefix = "[WARN] ";
const errorPrefix = "[ERR]  ";

var loggerIsSilent = false;

const initLogger = (isSilent) => {
  loggerIsSilent = isSilent;
};

const info = (...infoMsg) => {
  logMessage(infoPrefix, infoMsg);
};

const warn = (...warnMsg) => {
  logMessage(warnPrefix, warnMsg);
};

const error = (...errorMsg) => {
  logMessage(errorPrefix, errorMsg);
};

const cleanLog = (message) => {
  if (!loggerIsSilent) {
    console.log(message);
  }
};

const logMessage = (prefix, messages) => {
  if (!loggerIsSilent) {
    let string = "[NEW]" + prefix;
    if (messages) {
      messages.forEach((msg) => {
        if (msg) {
          string += msg + " ";
        }
      });
    }
    console.log(string);
  }
};

module.exports = { initLogger, info, warn, error, cleanLog };
