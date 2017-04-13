import React, {
  Component,
  PropTypes,
} from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native'
import { connect } from 'react-redux'
import Layout from '../constants/Layout'
import Touchable from '../common/F8Touchable'
import SettingsCell from '../common/SettingsCell'
import Colors from '../constants/Colors'
import { Text } from '../common/F8Text'
import Icon from 'react-native-vector-icons/Ionicons'
import { withNavigation } from '@exponent/ex-navigation'

@withNavigation
class PersonPage extends Component {
  render() {
    const { navigator, user } = this.props
    const isLogined = !!user.token
    const stateText = isLogined ? 'Logined' : 'Better Press to Login'
    const stateColor = isLogined ? Colors.green : 'orange'
    const avatarURL = user.avatar || 'a'
    const pressLogin = isLogined ? _ => {} : _ => navigator.push('Login')

    return (
      <ScrollView
        style={styles.container}
        automaticallyAdjustContentInsets={false}
        contentInset={Layout.contentInset}
        contentOffset={{x:0, y: -Layout.contentInset.top}}
      >
        <Touchable
          style={styles.userTouch}
          onPress={_ => navigator.push('UserDetail', user)}>
          <View style={styles.user}>
            <Image
              source={{uri: avatarURL}}
              style={styles.avatar}
            />
            <View style={styles.nameInfo}>
              <Text style={styles.name}>
                {user.login}
              </Text>
            </View>
            <Text
              style={{color: stateColor, marginRight: 5}}
              onPress={pressLogin}>
              {stateText}
            </Text>
            <Icon
              name='ios-arrow-forward'
              size={20}
              style={styles.arrow}
              color={'#808080'}/>
          </View>
        </Touchable>
        <SettingsCell iconName={'ios-cog'}/>
      </ScrollView>
    )
  }
}

PersonPage.propTypes = {}
PersonPage.defaultProps = {}

const select = ({ login }) => {
  return {
    user: login.user
  }
}

export default connect(select)(PersonPage)

var styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0EFF5',
    flex: 1,
  },
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
  avatar: {
    backgroundColor: Colors.imagePlaceholder,
    borderRadius: 2,
    width: 48,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 0.5,
  },
  nameInfo: {
    flexDirection: 'column',
    marginLeft: 8,
    justifyContent: 'center',
    flex: 1,
  },
  name: {
    color: 'black',
    fontSize: 17,
  },
  arrow: {
    width: 20,
    height: 20,
  },
  settings: {
    height: 44,
  },
});