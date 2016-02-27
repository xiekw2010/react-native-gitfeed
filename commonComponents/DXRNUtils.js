var React = require('react-native');
const Platform = require('Platform');

var {
  NativeModules: {
    DXRNUtils,
  }
} = React;

var Uitls = {
  clearCookie(cb) {
    if (Platform.OS === 'android') {
      // TODO:

    } else if (Platform.OS === 'ios') {
      console.log('clear cookies');
      DXRNUtils.clearCookies((error, results) => {
        if (error) {
          console.log('clearCookie error occured' + error);
        }
      });
    }
  },

  trackClick(name, atr) {
    if (Platform.OS === 'android') {
      // TODO:

    } else if (Platform.OS === 'ios') {
      DXRNUtils.trackClick(name, atr);
    }
  },

  appInfo(cb) {
    if (Platform.OS === 'android') {
      // TODO:

    } else if (Platform.OS === 'ios') {
      DXRNUtils.appInfo((info) => {
        cb && cb(info);
      });
    }
  }
};

module.exports = Uitls;
