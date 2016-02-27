const React = require('react-native');
const Colors = require('../commonComponents/Colors');
const CommonComponents = require('../commonComponents/CommonComponents');

const {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableHighlight,
} = React;


const UserCell = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
  },

  openTargetUser() {
    const user = this.props.user;
    const type = user.type;
    if (type == 'User') {
      this.props.navigator.push({id: 'user', obj: user});
    } else {
      this.props.navigator.push({id: 'org', obj: user});
    }
  },

  render() {
    const user = this.props.user;

    return (
      <TouchableHighlight onPress={this.openTargetUser} underlayColor={'lightGray'}>
        <View style={styles.cellContentView}>
          <Image style={styles.avatar} source={{uri: user.avatar_url}}/>
          <Text style={styles.userName}>{user.login}</Text>
        </View>
      </TouchableHighlight>
    )
  },
});

const styles = StyleSheet.create({
  cellContentView: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    borderColor: Colors.borderColor,
    borderBottomWidth: 0.5,
  },
  avatar: {
    width: 40,
    height: 40,
    marginLeft: 15,
    backgroundColor: 'lightGray',
  },
  userName: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 20,
  },

});

module.exports = UserCell
