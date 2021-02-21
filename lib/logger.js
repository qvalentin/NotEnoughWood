module.exports = log = (errorMsg, moreMsg) => {
  console.log("[NEW] " + errorMsg + (moreMsg ? " " + moreMsg : ""));
};
