/**
 * @providesModule RCTRefreshControl
 */
'use strict';

var React = require('react-native');
var {
  DeviceEventEmitter,
  NativeModules: {
    DXRefreshControl,
  }
} = React;

/**
 * A pull down to refresh control like the one in Apple's iOS6 Mail App.
 */

var DROP_VIEW_DID_BEGIN_REFRESHING_EVENT = 'dropViewDidBeginRefreshing';

var callbacks = {};

var subscription = DeviceEventEmitter.addListener(
  DROP_VIEW_DID_BEGIN_REFRESHING_EVENT,
  (reactTag) => callbacks[reactTag]()
);
// subscription.remove();

var DXRNRefreshControl = {
  configureCustom(node, config, callback) {
    var nodeHandle = React.findNodeHandle(node) || 1;
    DXRefreshControl.configureCustom(nodeHandle, config, (error) => {
      if (!error) {
        callbacks[nodeHandle] = callback;
      }
    });
  },

  endRefreshing(node) {
    var nodeHandle = React.findNodeHandle(node) || 1;
    DXRefreshControl.endRefreshing(nodeHandle);
  },

  beginRefreshing(node) {
    var nodeHandle = React.findNodeHandle(node) || 1;
    DXRefreshControl.beginRefreshing(nodeHandle);
  }
};

module.exports = DXRNRefreshControl;
