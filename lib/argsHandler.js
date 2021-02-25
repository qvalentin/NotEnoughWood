module.exports = argsHandler = (argsArray) => {
  let resultingObject = {
    port: null,
  };

  // expected states
  let expectPortNext = false;

  // handler
  argsArray.forEach((arg) => {
    switch (arg) {
      case "-p":
        expectPortNext = true;
        break;

      default:
        if (expectPortNext) {
          arg = arg.trim();
          if (arg !== null && arg !== undefined) {
            resultingObject.port = arg;
          }
        }
        break;
    }
  });

  return resultingObject;
};
