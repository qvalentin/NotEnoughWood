const infoPrefix = '[INFO] ';
const warnPrefix = '[WARN] ';
const errorPrefix = '[ERR]  ';

var loggerIsSilent = false;
var loggerHasDebugEnabled = false;

const initLogger = (isSilent, debugEnabled) => {
	loggerIsSilent = isSilent;
	loggerHasDebugEnabled = debugEnabled;
};

const info = (...infoMsg) => {
	if (loggerHasDebugEnabled) {
		logMessage(infoPrefix, infoMsg);
	}
};

const warn = (...warnMsg) => {
	if (loggerHasDebugEnabled) {
		logMessage(warnPrefix, warnMsg);
	}
};

const error = (...errorMsg) => {
	logMessage(errorPrefix, errorMsg);
};

const cleanLog = message => {
	if (!loggerIsSilent && loggerHasDebugEnabled) {
		console.log(message);
	}
};

const logMessage = (prefix, messages) => {
	if (!loggerIsSilent) {
		let string = '[NEW]' + prefix;
		if (messages) {
			messages.forEach(msg => {
				if (msg) {
					string += msg + ' ';
				}
			});
		}
		console.log(string);
	}
};

module.exports = { initLogger, info, warn, error, cleanLog };
