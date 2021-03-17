const path = require("path");

module.exports = buildServeConfig = (folderPath, configJson) => {
  const serveConfig = {
    public: path.join(folderPath, configJson.virtualFolderName),
    redirects: [],
  };

  if (configJson.faviconPath) {
    serveConfig.redirects.push({
      source: "/favicon.ico",
      destination: configJson.faviconPath,
    });
  }

  return serveConfig;
};
