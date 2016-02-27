const React = require('react-native');
const GHService = require('../networkService/GithubServices');
const CommonComponents = require('../commonComponents/CommonComponents');
const Colors = require('../commonComponents/Colors');
const SettingComponent = require('../AppComponents/SettingsCell');
const DXRNUtils = require('../commonComponents/DXRNUtils');

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
  Alert,
} = React;

const ICON_SIZE = 30;

const PersonComponent = React.createClass({
  pressLogin() {
    const isLogined = GHService.isLogined();
    if (isLogined) return;

    this.props.navigator.push({
      id: 'login',
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      title: 'Please Login now',
    });

    DXRNUtils.trackClick('设置界面用户点击登录');
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
        DXRNUtils.trackClick('设置界面用户点击登出');
        GHService.logout();
      }
    });
  },

  onEditProfile() {
    if (GHService.isLogined()) {
      this.props.navigator.push({id: 'editprofile'});
    } else {
      this.props.navigator.push({
        id: 'login',
        title: 'Edit need login',
        sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      });
    }
  },

  render() {
    const user = GHService.currentUser();
    const isLogined = GHService.isLogined();
    const stateText = isLogined ? 'Logined' : 'Better Press to Login';
    const stateColor = isLogined ? Colors.green : 'orange';
    const logoutColor = isLogined ? Colors.red : 'orange';
    const avatarURL = user.avatar || 'a';
    return (
      <ScrollView
        style={styles.container}
        automaticallyAdjustContentInsets={false}
        >
        <View style={styles.userTouch}>
          <Image
            source={{uri: avatarURL}}
            style={styles.avatar}
            />
          <Text style={styles.name}>
            {user.login}
          </Text>
          <Text
            style={[styles.loginState, {color: stateColor}]}
            onPress={this.pressLogin}>
            {stateText}
          </Text>
        </View>
        <TouchableHighlight>
          <View style={styles.menu}>
            <Text style={styles.menuText}>
              Feed
            </Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight>
          <View style={styles.menu}>
            <Text style={styles.menuText}>
              Explore
            </Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight>
          <View style={styles.menu}>
            <Text style={styles.menuText}>
              Famous
            </Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight>
          <View style={styles.menu}>
            <Text style={styles.menuText}>
              Me
            </Text>
          </View>
        </TouchableHighlight>
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
    backgroundColor: 'white',
    flex: 1,
  },
  userTouch: {
    height: 200,
    backgroundColor: 'blue',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  avatar: {
    backgroundColor: 'lightGray',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 0.5,
    marginBottom: 20,
  },
  name: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  menu: {
    backgroundColor: 'white',
    height: 50,
  },
  menuText: {
    color: Colors.black,
    fontWeight: 'bold',
    fontSize: 16,
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
