const { exec } = require("child_process");
const { info, error, cleanLog } = require("./logger");

let cache = [];

function getLogs(log, cachingEnabledFlag, defaultCachingTime) {
  return new Promise((resolve, reject) => {
    // defaults to true
    cachingEnabledFlag =
      cachingEnabledFlag === undefined ? true : cachingEnabledFlag;

    if (!cachingEnabledFlag) {
      exec(log.command, (err, stdout, stderr) => {
        if (err == null) {
          resolve({ content: stdout });
        } else {
          reject(err);
        }
      });
    } else {
      // CACHING ENABLED
      cleanLog("---------------------------");
      info("requested:", log.name);
      let possibleLogEntry = validCacheForLog(log.name);

      if (possibleLogEntry == null) {
        //if not existing and cache enabled add it to cache
        //if existing and invalid update
        exec(log.command, (err, stdout, stderr) => {
          if (err == null) {
            let nextUpdate = createCacheForLog(log, defaultCachingTime, stdout);
            resolve({ content: stdout, nextUpdate: nextUpdate });
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

function validCacheForLog(name) {
  let foundEntries = cache.filter((entry) => entry.name === name);
  if (foundEntries.length === 0) return null;
  if (foundEntries.length > 1)
    error("more than one entry was found in cache with the name " + name);
  if (foundEntries.length === 1) {
    let entry = foundEntries[0];
    let currentTime = Date.now();
    if (entry.validUntil < currentTime) {
      // is invalid
      cache.splice(cache.indexOf(entry), 1);
      return null;
    } else {
      info("Cache was still valid.");
      return entry;
    }
  }
}

function createCacheForLog(log, defaultCachingTime, content) {
  info("cache for", log.name, "expired, creating new one");
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

/*
function debugCache() {
  logger("----- CACHE -----");
  logger("cache length:", cache.length);
  cache.forEach((entry) => {
    logger("  ->", entry.name, entry.validUntil, entry.content.length);
  });
}*/

module.exports = { getLogs };
