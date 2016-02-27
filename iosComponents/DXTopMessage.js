/**
 * @providesModule DXTopMessageManager
 * @flow
 */
const React = require('react-native');
const Platform = require('Platform');

const {
  DeviceEventEmitter,
  NativeModules: {
    DXTopMessageManager,
  }
} = React;

/**
 * A pull down to refresh control like the one in Apple's iOS6 Mail App.
 */

const MESSAGE_TAPPED = 'messageTapped';

const callbacks = {};

const subscription = DeviceEventEmitter.addListener(
  MESSAGE_TAPPED,
  (reactTag) => callbacks[reactTag]()
);
// subscription.remove();

const DXRNTopMessage = {
  showTopMessage(node, message, config, callback) {
    if (Platform.OS === 'android') {
    } else if (Platform.OS === 'ios') {
      const nodeHandle = React.findNodeHandle(node) || 1;
      DXTopMessageManager.showTopMessage(nodeHandle, message, config, () => {
        callbacks[nodeHandle] = callback;
      });
    }
  },
};

module.exports = DXRNTopMessage;
