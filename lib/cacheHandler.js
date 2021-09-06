const { exec } = require('child_process');
const fs = require('fs');
const { info, error, cleanLog } = require('./logger');

// CONSTANTS
const MAX_BUFFER_ERROR_MESSAGE =
	'RangeError [ERR_CHILD_PROCESS_STDIO_MAXBUFFER]: stdout maxBuffer length exceeded';

let cache = [];

function getLogs(
	log,
	cachingEnabledFlag,
	defaultCachingTime,
	defaultTailLines,
	overwriteTailLines,
) {
	return new Promise((resolve, reject) => {
		// defaults to true
		cachingEnabledFlag =
			cachingEnabledFlag === undefined ? true : cachingEnabledFlag;

		if (!cachingEnabledFlag) {
			getLog(log, overwriteTailLines)
				.then(result => {
					resolve({ content: result, tailLines: overwriteTailLines });
				})
				.catch(err => {
					if (errorComesFromMaxBuffer(err)) {
						handleTailFallbackOfCommands(log, resolve, reject);
					} else {
						reject(err);
					}
				});
		} else {
			// CACHING ENABLED
			cleanLog('---------------------------');
			info('requested:', log.name);

			let possibleLogEntry = getValidCacheForLogIfExisiting(log.name);

			if (possibleLogEntry == null) {
				//if not existing and cache enabled add it to cache
				//if existing and invalid update
				getLog(log, overwriteTailLines)
					.then(result => {
						let nextUpdate = createCacheForLog(
							log,
							defaultCachingTime,
							result,
						);
						resolve({
							content: result,
							nextUpdate: nextUpdate,
							tailLines: overwriteTailLines,
						});
					})
					.catch(err => {
						if (errorComesFromMaxBuffer(err)) {
							// if the command was to large rerun with default tail lines. This also applies to custom
							// tailLines
							handleTailFallbackOfCommands(
								log,
								resolve,
								reject,
								defaultTailLines,
							);
						} else {
							reject(err);
						}
					});
			} else {
				resolve({
					content: possibleLogEntry.content,
					nextUpdate: possibleLogEntry.validUntil,
				});
			}
		}
	});
}

function getValidCacheForLogIfExisiting(name) {
	let foundEntries = cache.filter(entry => entry.name === name);
	if (foundEntries.length === 0) return null;
	if (foundEntries.length > 1)
		error('more than one entry was found in cache with the name ' + name);
	if (foundEntries.length === 1) {
		let entry = foundEntries[0];
		let currentTime = Date.now();
		if (entry.validUntil < currentTime) {
			// is invalid
			cache.splice(cache.indexOf(entry), 1);
			return null;
		} else {
			info('Cache was still valid.');
			return entry;
		}
	}
}

function createCacheForLog(log, defaultCachingTime, content) {
	info('cache for', log.name, 'expired, creating new one');
	let cachingTimeSeconds =
		(log.cachingTime ? log.cachingTime : defaultCachingTime) * 1000;
	let validUntil = Date.now() + cachingTimeSeconds;
	let cacheEntry = {
		name: log.name,
		validUntil: validUntil,
		content: content,
	};
	cache.push(cacheEntry);
	return validUntil;
}

function getLog(log, overwriteTailLines) {
	return new Promise((resolve, reject) => {
		switch (log.source.type) {
			case 'command':
				let command = log.source.resource;
				if (overwriteTailLines && overwriteTailLines > 0) {
					command = command + ' | tail -n ' + overwriteTailLines;
				}

				exec(command, (err, stdout, stderr) => {
					if (err == null) {
						resolve(stdout);
					} else {
						reject(err);
					}
				});
				break;

			case 'file':
				fs.readFile(log.source.resource, (err, data) => {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
				break;

			default:
				reject("Couln't resolve type " + log.source.type);
				break;
		}
	});
}

function handleTailFallbackOfCommands(log, resolve, reject, defaultTailLines) {
	// check if the specific settings overwrite the default ones.
	if (log.tailLines && !isNaN(log.tailLines) && log.tailLines > 0) {
		getLog(log, log.tailLines)
			.then(result => {
				resolve({ content: result, tailLines: log.tailLines });
			})
			.catch(err => {
				if (errorComesFromMaxBuffer(err)) {
					reject(
						'The command returned to much. Consider making the requested data smaller, or lower the tailLines key in the config. (Current amount of lines used with tail: ' +
							log.tailLines +
							')',
					);
				} else {
					reject(err);
				}
			});
	} else {
		// handle tailing with default options.
		if (
			defaultTailLines &&
			!isNaN(defaultTailLines) &&
			defaultTailLines > 0
		) {
			getLog(log, defaultTailLines)
				.then(result => {
					resolve({ content: result, tailLines: defaultTailLines });
				})
				.catch(err => {
					if (errorComesFromMaxBuffer(err)) {
						reject(
							'The command returned to much. Consider making the requested data smaller, or lower the defaultTailLines key in the config. (Current amount of lines used with tail: ' +
								defaultTailLines +
								')',
						);
					} else {
						reject(err);
					}
				});
		} else {
			reject(
				'No defaultTailLines specified and the command returned to much. Consider making the requested data smaller, or use the defaultTailLines key in the config.',
			);
		}
	}
}

function errorComesFromMaxBuffer(err) {
	return err && MAX_BUFFER_ERROR_MESSAGE === err.toString();
}

module.exports = { getLogs };
