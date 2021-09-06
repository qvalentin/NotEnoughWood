const fs = require('fs');
const version = process.argv[2];

const readPackage = JSON.parse(fs.readFileSync('package.json'));
readPackage.version = version;
fs.writeFileSync('package.json', JSON.stringify(readPackage));
