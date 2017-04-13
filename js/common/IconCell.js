'use strict'

import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native'
import Color from '../constants/Colors'
import Icon from 'react-native-vector-icons/Ionicons'
import CStyles from '../constants/Styles'

class IconCell extends Component {
  render() {
    const { text, leftIcon, rightIcon, onPressRightIcon, onPress } = this.props
    let rightButton
    if (rightIcon) {
      rightButton = (
        <TouchableOpacity
          style={styles.rightIconButton}
          onPress={onPressRightIcon}>
          <Icon name={rightIcon}
                size={30}
                color={Color.lightBlack}
                style={{ marginHorizontal: 15 }}/>
        </TouchableOpacity>
      )
    }
    return (
      <View>
        <TouchableOpacity
          onPress={onPress}
          style={styles.container}>
          <Icon name={leftIcon}
                size={20}
                color={Color.lightBlack}
                style={{ marginHorizontal: 15 }}/>
          <Text style={styles.text}>
            {text}
          </Text>
          {rightButton}
        </TouchableOpacity>
        <View style={CStyles.separatorViewStyle}/>
      </View>
    )
  }
}

IconCell.propTypes = {
  text: PropTypes.string.isRequired,
  leftIcon: PropTypes.string,
  rightIcon: PropTypes.string,
  onPressRightIcon: PropTypes.func,
  onPress: PropTypes.func
}
IconCell.defaultProps = {
  text: '使用 Icon cell',
  leftIcon: 'ios-time-outline',
}

module.exports.__cards__ = (define) => {
  define('normal', _ => <IconCell/>)
  define('right', _ => <IconCell rightIcon={'ios-close-outline'}/>)
}

export default IconCell

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: 'white'
  },
  text: {
    fontSize: 15,
    color: Color.black
  },
  rightIconButton: {
    width: 40,
    height: 40,
    position: 'absolute',
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
})