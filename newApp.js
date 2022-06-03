const serveHandler = require('serve-handler');
const auth = require('basic-auth');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { exit } = require('process');

// custom stuff
const { initLogger, info, warn, error } = require('./lib/logger');
const { getLogs } = require('./lib/cacheHandler');
const applyCustomHeader = require('./lib/customHeader');
const serveConfigBuilder = require('./lib/serveConfigBuilder');

function newApp(flags) {
	process.title = 'NotEnoughWood';

	// init logger
	let loggerIsSilent = flags.silent !== undefined;
	let loggerIsInDebug = flags.debug !== undefined;
	initLogger(loggerIsSilent, loggerIsInDebug);

	// handle args
	let port = 4200;
	let configPath;
	let folderPath = '';

	if (flags.port != undefined) {
		port = flags.port;
	}
	if (flags.config != undefined) {
		configPath = flags.config;
	}
	if (flags.folder != undefined) {
		folderPath = flags.folder;
	}

	// handle version
	const version = getVersion();

	// config
	let configJson = null;

	// serve config
	let serveConfig = null;

	const authHandler = (req, res) => {
		if (
			configJson &&
			configJson.authentication &&
			configJson.authentication.enabled
		) {
			let credentials = auth(req);

			// Check credentials
			if (
				!credentials ||
				!check(credentials.name, credentials.pass, configJson)
			) {
				res.setHeader(
					'WWW-Authenticate',
					"Basic realm='NEWloggerRealm'",
				);
				res.writeHead(401).end('Access denied');
			} else {
				logHandler(req, res);
			}
		} else {
			logHandler(req, res);
		}
	};

	const logHandler = (req, res) => {
		if (req.url.includes('.log')) {
			let foundFileName = req.url.split('/');
			if (foundFileName.length != 2) {
				warn('did not find foundFileName:', foundFileName);
				res.writeHead(404).end();
			} else {
				//split .log
				foundFileName = foundFileName[1];
				foundFileName = foundFileName.split('.log')[0];
				foundFileName = decodeURIComponent(foundFileName);

				// compare with logs
				let logs = configJson.logs;
				logs = logs.filter(l => l.name === foundFileName);
				if (logs != null && logs.length == 1) {
					currentLog = logs[0];
					if (currentLog.source != null) {
						// check user agent to enable / disable html support for the header.
						const usePlainText =
							userWantsPlainTextOrComesFromCurl(req); // this does return true or null
						const query = parseQueryParams(req);
						const customTailLength = query.tail;

						getLogs(
							currentLog,
							currentLog.cachingEnabled,
							configJson.defaultCachingTime,
							configJson.defaultTailLines,
							customTailLength,
						)
							.then(({ content, nextUpdate, tailLines }) => {
								content = applyCustomHeader(
									content,
									currentLog,
									nextUpdate,
									version,
									usePlainText,
									tailLines,
								);
								res.writeHead(200).end(content);
							})
							.catch(err => {
								error(
									'Encountered Exception while displaying',
									currentLog.name + '.',
									err,
								);
								if (err) {
									res.writeHead(500).end(
										'Encountered Exception while displaying<b> ' +
											currentLog.name +
											'</b></br>' +
											err,
									);
								} else {
									res.writeHead(500).end(
										'Encountered Exception while displaying<b> ' +
											currentLog.name +
											'</b></br>' +
											err,
									);
								}
							});
					} else {
						res.writeHead(404).end(
							'No source for log in config specified.',
						);
					}
				} else {
					res.writeHead(404).end(
						"Couldn't find a logfile with this name.",
					);
				}
			}
		} else {
			serveHandler(req, res, serveConfig);
		}
	};

	const server = http.createServer(authHandler);
	server.listen(port, () => {
		// read config.
		try {
			configJson = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

			if (
				configJson.virtualFolderName === null ||
				configJson.virtualFolderName === undefined
			) {
				error('virtualFolderName was not valid!');
				error('Exiting...');
				exit(1);
			}
		} catch (err) {
			error('Config was not valid!', err);
			error('Exiting...');
			exit(1);
		}

		const virtualFolder = path.join(
			folderPath,
			configJson.virtualFolderName,
		);
		// delete folder
		try {
			fs.rmdirSync(virtualFolder, { recursive: true });
		} catch (err) {
			error(`Error while deleting ${virtualFolder}`, `${err}.`);
		}

		// create fake folder
		try {
			if (!fs.existsSync(virtualFolder)) {
				fs.mkdirSync(virtualFolder);
			}
		} catch (err) {
			error(`Error while creating virtual Folder: ${err}.`);
		}

		// create fake logfiles
		if (configJson.logs && configJson.logs.length != null) {
			configJson.logs.forEach(log => {
				// this does overwrite!
				fs.writeFileSync(
					path.join(
						folderPath,
						configJson.virtualFolderName,
						log.name + '.log',
					),
					'If you are seeing this in the browser, something fishy happend.',
				);
			});
		}

		// build serve config
		serveConfig = serveConfigBuilder(folderPath, configJson);

		info('Started on: http://localhost:' + port);
	});
}

function getVersion() {
	// get version
	let foundVersion = 'UNKOWN';
	try {
		const json = fs.readFileSync(path.join(__dirname, './package.json'));
		const possibleVersion = JSON.parse(json).version;
		foundVersion = possibleVersion ? possibleVersion : foundVersion;
	} catch (error) {
		warn("Couln't find the package.json file.");
		warn('This might break something.');
	}
	return foundVersion;
}

function check(name, pass, configJson) {
	var valid = true;

	valid = name === configJson.authentication.username && valid;
	valid = pass === configJson.authentication.password && valid;

	return valid;
}

/**
 * Insecure way to check if the request comes from a curl user agent, or if the param is 'plain=true'. DO NOT USE THIS FOR SECURITY RELEVANT CODE.
 * @param {*} req the request object
 *
 */
function userWantsPlainTextOrComesFromCurl(req) {
	const query = parseQueryParams(req);
	const userAgent = req.headers['user-agent'];
	const userAgentIsCurl = userAgent.startsWith('curl/');
	const userRequestedIt = query.plain === 'true';
	return userAgentIsCurl || userRequestedIt;
}

/**
 * very hacky solution to parse query params
 * @param {*} req the request object
 *
 */
function parseQueryParams(req) {
	let q = req.url.split('?'),
		result = {};
	if (q.length >= 2) {
		q[1].split('&').forEach(item => {
			try {
				result[item.split('=')[0]] = item.split('=')[1];
			} catch (e) {
				result[item.split('=')[0]] = '';
			}
		});
	}
	return result;
}

module.exports = newApp;
