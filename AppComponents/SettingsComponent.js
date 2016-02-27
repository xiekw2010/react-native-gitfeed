const React = require('react-native');
const GHService = require('../networkService/GithubServices');
const CommonComponents = require('../commonComponents/CommonComponents');
const Colors = require('../commonComponents/Colors');
const SettingComponent = require('./SettingsCell');
const GFDiskCache = require('../iosComponents/GFDiskCache');
const DXRNUtils = require('../commonComponents/DXRNUtils');
const Platform = require('Platform');

const {
  View,
  ActivityIndicatorIOS,
  Text,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  Image,
  TouchableOpacity,
  Navigator,
  ActionSheetIOS,
  LinkingIOS,
  Alert,
} = React;

const ICON_SIZE = 30;

const PersonComponent = React.createClass({
  getInitialState() {
    return {
      cachedSize: null,
      appVersion: '',
      appBuild: '',
      appStoreURL: '',
    };
  },

  componentWillMount() {
    GFDiskCache.getDiskCacheCost((size) => {
      this.setState({
        cachedSize: size,
      });
    });

    DXRNUtils.appInfo((appInfo) => {
      this.setState({
        appVersion: appInfo.appVersion,
        appBuild: appInfo.appBuild,
        appStoreURL: appInfo.appStoreURL,
        rateURL: appInfo.rateURL,
      });
    });
  },

  onShare() {
    if (Platform.OS === 'android') {
      return;
    }

    const message = 'This Github app is awesome';
    ActionSheetIOS.showShareActionSheetWithOptions({
      message: message,
      url: 'https://appsto.re/cn/jhzxab.i',
    },
    () => {},
    () => {});
  },

  pressLogout() {
    const title = 'Are you sure to leave?';

    if (Platform.OS === 'android') {
      Alert.alert(
        title,
        null,
        [
          {text: 'logout', onPress: () => GHService.logout()},
          {text: 'cancel', onPress: () => console.log('Bar Pressed!')}
        ]
      )
    } else if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({
        title: 'Are you sure to leave?',
        options:['logout', 'cancel'],
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex == 0) {
          DXRNUtils.trackClick('设置界面用户点击登出');
          GHService.logout();
        }
      });
    }
  },

  onRate() {
    const rURL = 'itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?type=Purple+Software&id=1079873993&pageNumber=0&sortOrdering=2&mt=8'
    LinkingIOS.openURL(rURL);
  },

  pressLogout() {
    ActionSheetIOS.showActionSheetWithOptions({
      title: 'Are you sure to leave?',
      options:['logout', 'cancel'],
      cancelButtonIndex: 1,
      destructiveButtonIndex: 0,
    },
    (buttonIndex) => {
      if (buttonIndex == 0) {
        DXRNUtils.trackClick('clickLogout', {name: '用户登出'});
        GHService.logout();
      }
    });
  },

  onOpenAuthor() {
    const user = {
      url: 'https://api.github.com/users/xiekw2010',
      login: 'xiekw2010'
    };

    this.props.navigator.push({id: 'user', obj: user});
  },

  render() {
    let cachedSize = this.state.cachedSize ? this.state.cachedSize : '...';
    cachedSize = 'Clear cache, current is: ' + cachedSize;

    let currentVersion = "Share this app! V: " + this.state.appVersion;
    currentVersion += ' b: ' + this.state.appBuild;

    const aboutUser = "About GitFeed's author";
    const isLogined = GHService.isLogined();
    const logoutColor = isLogined ? Colors.red : 'orange';

    let top = 0;
    if (Platform.OS === 'android') {
      top = 44;
    }

    return (
      <ScrollView
        style={[styles.container, {marginTop: top}]}
        automaticallyAdjustContentInsets={false}
        contentInset={{top: 64, left: 0, bottom: 49, right: 0}}
        contentOffset={{x:0, y:-64}}
        >
        <SettingComponent
          iconName={'ios-trash'}
          iconColor={Colors.blue}
          settingName={cachedSize}
          onPress={() => {GFDiskCache.clearDiskCache((size) => {
            this.setState({
              cachedSize: size,
            });
          })}}/>
        <SettingComponent
          iconName={'share'}
          iconColor={Colors.green}
          settingName={currentVersion}
          onPress={this.onShare}
          />
        <SettingComponent
          iconName={'ios-star'}
          iconColor={'#FDCC4F'}
          settingName={'Give some advices'}
          onPress={this.onRate}
          />
        <SettingComponent
          iconName={'university'}
          iconColor={Colors.purple}
          settingName={aboutUser}
          onPress={this.onOpenAuthor}
          />
        <TouchableOpacity
          style={[styles.logout, {backgroundColor: logoutColor}]}
          onPress={this.pressLogout}>
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0EFF5',
    flex: 1,
  },
  logout: {
    height: 44,
    borderRadius: 3,
    margin: 10,
    marginTop: 40,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  }
});

module.exports = PersonComponent;
