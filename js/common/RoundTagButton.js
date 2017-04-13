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

class RoundTabButton extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { color, text, style } = this.props
    return (
      <TouchableOpacity
        onPress={this.props.onSelect}
        style={[styles.container, { borderColor: color }, style ]}>
        <Text style={[styles.text, { color: color }]}>
          {text}
        </Text>
      </TouchableOpacity>
    )
  }
}

RoundTabButton.propTypes = {
  color: PropTypes.string,
  text: PropTypes.string.isRequired,
  onSelect: PropTypes.func
}

RoundTabButton.defaultProps = {
  color: Color.lightBlack,
  text: '金馆长'
}

module.exports = RoundTabButton

module.exports.__cards__ = (define) => {
  define('Gray', (state = true, update) =>
    <RoundTabButton color={Color.green} text={'周杰伦'} onSelect={() => console.log('hellow')} />)
}

var styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
    borderRadius: 17,
    paddingLeft: 12,
    paddingRight: 12,
    borderWidth: 1,
  },
  text: {}
})