const { exec } = require("child_process");
const fs = require("fs");
const { info, error, cleanLog } = require("./logger");

let cache = [];

function getLogs(log, cachingEnabledFlag, defaultCachingTime) {
  return new Promise((resolve, reject) => {
    // defaults to true
    cachingEnabledFlag =
      cachingEnabledFlag === undefined ? true : cachingEnabledFlag;

    if (!cachingEnabledFlag) {
      getLog(log)
        .then((result) => {
          resolve({ content: result });
        })
        .catch((err) => {
          reject(err);
        });
    } else {
      // CACHING ENABLED
      cleanLog("---------------------------");
      info("requested:", log.name);

      let possibleLogEntry = getValidCacheForLogIfExisiting(log.name);

      if (possibleLogEntry == null) {
        //if not existing and cache enabled add it to cache
        //if existing and invalid update
        getLog(log)
          .then((result) => {
            let nextUpdate = createCacheForLog(log, defaultCachingTime, result);
            resolve({ content: result, nextUpdate: nextUpdate });
          })
          .catch((err) => {
            reject(err);
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

function getLog(log) {
  return new Promise((resolve, reject) => {
    switch (log.source.type) {
      case "command":
        exec(log.source.resource, (err, stdout, stderr) => {
          if (err == null) {
            resolve(stdout);
          } else {
            reject(err);
          }
        });
        break;

      case "file":
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

/*
function debugCache() {
  logger("----- CACHE -----");
  logger("cache length:", cache.length);
  cache.forEach((entry) => {
    logger("  ->", entry.name, entry.validUntil, entry.content.length);
  });
}*/

module.exports = { getLogs };
