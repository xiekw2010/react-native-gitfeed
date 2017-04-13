/**
 * @providesModule Layout
 * @flow
 */

import {
  Dimensions,
  Platform,
  NativeModules,
} from 'react-native';

const useDrawerNavigation = Platform.OS === 'android';
// const useDrawerNavigation = false;

export default {
  navigationLayoutRoute: useDrawerNavigation ? 'drawerNavigationLayout' : 'tabNavigationLayout',
  statusBarHeight: 20,
  window: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  contentInset: { top: 64, left: 0, right: 0, bottom: 49 },
  navIconSize: { width: 30, marginHorizontal:8, marginVertical: 6}
};
