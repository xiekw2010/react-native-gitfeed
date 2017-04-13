import React, {
  Component,
  PropTypes,
} from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Touchable from '../common/F8Touchable'

const SettingsCell = props => {
  let iconComponent
  if (props.iconName) {
    iconComponent = <Icon
      name={props.iconName}
      size={ICON_SIZE}
      style={styles.arrow}
      color={props.iconColor}/>
  }

  let arrow
  if (props.hasArrow) {
    arrow = <Icon
      name='ios-arrow-forward'
      size={20}
      iconStyle={styles.arrow}
      color={'#808080'}/>
  }

  let rightText
  if (props.rightText) {
    rightText = <Text style={
    {
      color: '#808080',
      marginRight: 10,
      fontSize: 17
    }}>
      {props.rightText}
    </Text>
  }

  return (
    <Touchable
      style={[styles.userTouch, props.style]}
      onPress={props.onPress}>
      <View style={styles.user}>
        {iconComponent}
        <View style={styles.nameInfo}>
          <Text style={styles.name}>
            {props.settingName}
          </Text>
        </View>
        <View style={styles.right}>
          {rightText}
          {arrow}
        </View>
      </View>
    </Touchable>
  )
}

SettingsCell.propTypes = {
  onPress: PropTypes.func,
  iconName: PropTypes.string,
  iconColor: PropTypes.string,
  settingName: PropTypes.string,
  hasArrow: PropTypes.bool,
  rightText: PropTypes.string,
}
SettingsCell.defaultProps = {
  iconColor: '#00bfff',
  settingName: 'Settings',
  onPress: _ => {},
  hasArrow: true,
  rightText: ''
}

export default SettingsCell

const ICON_SIZE = 30
const styles = StyleSheet.create({
  userTouch: {
    marginTop: 20
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
    borderColor: '#EDECF1'
  },
  nameInfo: {
    flexDirection: 'column',
    marginLeft: 0,
    justifyContent: 'center',
    flex: 1
  },
  name: {
    color: 'black',
    fontSize: 17
  },
  right: {
    flexDirection: 'row',
    marginRight: 10
  },
  arrow: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  settings: {
    height: 44
  }
})