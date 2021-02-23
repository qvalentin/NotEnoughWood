module.exports = log = (errorMsg, ...moreMsg) => {
  let string = "[NEW] " + errorMsg + " ";
  moreMsg.forEach((msg) => {
    if (msg != null) {
      string += msg + " ";
    }
  });
  console.log(string);
};
