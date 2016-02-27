const React = require('react-native');
const GHService = require('../networkService/GithubServices');
const CommonComponents = require('../commonComponents/CommonComponents');
const Icon = require('react-native-vector-icons/Ionicons');
const Colors = require('../commonComponents/Colors');

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
} = React;

const ICON_SIZE = 30;

const SettingsComponent = React.createClass({
  propTypes: {
    onPress: React.PropTypes.func,
    iconName: React.PropTypes.string,
    iconColor: React.PropTypes.string,
    settingName: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      iconName: 'ios-cog',
      iconColor: Colors.blue,
      settingName: 'Settings',
    }
  },

  render() {
    return (
      <TouchableHighlight
        underlayColor={'lightGray'}
        style={styles.userTouch}
        onPress={this.props.onPress}>
        <View style={styles.user}>
          <Icon
            name={this.props.iconName}
            size={ICON_SIZE}
            style={styles.arrow}
            color={this.props.iconColor}/>
          <View style={styles.nameInfo}>
            <Text style={styles.name}>
              {this.props.settingName}
            </Text>
          </View>
          <Icon
            name='ios-arrow-right'
            size={20}
            iconStyle={styles.arrow}
            color={Colors.textGray}/>
        </View>
      </TouchableHighlight>
    );
  }
});

var styles = StyleSheet.create({
  userTouch: {
    marginTop: 20,
  },
  user: {
    padding: 8,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EDECF1',
  },
  nameInfo: {
    flexDirection: 'column',
    marginLeft: 0,
    justifyContent: 'center',
    flex: 1,
  },
  name: {
    color: 'black',
    fontSize: 17,
  },
  arrow: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginRight: 10,
  },
  settings: {
    height: 44,
  },
});

module.exports = SettingsComponent;
