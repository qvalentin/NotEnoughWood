const { exec } = require("child_process");
const { error } = require("console");
const logger = require("./logger");

let cache = [];

function getLogs(log, cachingEnabledFlag, defaultCachingTime) {
  return new Promise((resolve, reject) => {
    if (!cachingEnabledFlag) {
      exec(log.command, (err, stdout, stderr) => {
        if (err == null) {
          createCacheForLog(log, defaultCachingTime);
          resolve(stdout);
        } else {
          reject(err);
        }
      });
    } else {
      // CACHING ENABLED
      console.log("---------------------------");
      logger("requested:", log.name);
      let possibleLogEntry = validCacheForLog(log.name);

      if (possibleLogEntry == null) {
        //if not existing and cache enabled add it to cache
        //if existing and invalid update
        exec(log.command, (err, stdout, stderr) => {
          if (err == null) {
            createCacheForLog(log, defaultCachingTime, stdout);
            resolve(stdout);
          } else {
            reject(err);
          }
        });
      } else {
        resolve(possibleLogEntry.content);
      }
    }
  });
}

function validCacheForLog(name) {
  let foundEntries = cache.filter((entry) => entry.name === name);
  if (foundEntries.length === 0) return null;
  if (foundEntries.length > 1)
    throw error("more than one entry was found in cache with the name " + name);
  if (foundEntries.length === 1) {
    let entry = foundEntries[0];
    let currentTime = Date.now();
    if (entry.validUntil < currentTime) {
      // is invalid
      cache.splice(cache.indexOf(entry), 1);
      return null;
    } else {
      logger("Cache was still valid.");
      return entry;
    }
  }
}

function createCacheForLog(log, defaultCachingTime, content) {
  logger("cache for", log.name, "expired, creating new one");
  let cachingTimeSeconds =
    (log.cachingTime ? log.cachingTime : defaultCachingTime) * 1000;
  let cacheEntry = {
    name: log.name,
    validUntil: Date.now() + cachingTimeSeconds,
    content: content,
  };
  cache.push(cacheEntry);
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
