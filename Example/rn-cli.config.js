const blacklist = require('metro-bundler/src/blacklist');

module.exports = {
  getBlacklistRE: function() {
    return blacklist([/[^e]\/node_modules\/react-native\/.*/]);
  }
};
