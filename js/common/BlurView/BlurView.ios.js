'use strict';

import React, {
  Component,
  PropTypes,
} from 'react';

import {
  View,
} from 'react-native';
import { BlurView as RNBlurView } from 'react-native-blur'

export default class BlurView extends Component {
  static propTypes = {
    tint: PropTypes.oneOf(['light', 'xlight', 'dark']).isRequired,
    intensity: PropTypes.number.isRequired,
    ...View.propTypes,
  };

  static defaultProps = {
    tint: 'light',
    intensity: 100,
  }

  render() {
    const { tint, intensity } = this.props

    return (
      <RNBlurView
        blurType={tint}
        blurAmount={intensity}
        style={this.props.style}
      >
        {this.props.children}
      </RNBlurView>
    );
  }
}
