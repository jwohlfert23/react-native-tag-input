const blacklist = require('metro/src/blacklist');

module.exports = {
  getBlacklistRE: function() {
    return blacklist([/[^e]\/node_modules\/react-native\/.*/]);
  }
};
