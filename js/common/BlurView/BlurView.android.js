'use strict';

import React, {
  Component,
  PropTypes,
} from 'react';

import {
  View,
} from 'react-native';

import deprecatedPropType from 'react-native/Libraries/Utilities/deprecatedPropType';

export default class BlurView extends Component {
  static propTypes = {
    tintEffect: deprecatedPropType(
      PropTypes.string,
      'Use the `tint` prop instead.'
    ),
    tint: PropTypes.oneOf(['light', 'default', 'dark']),
    ...View.propTypes,
  };

  render() {
    let { tint } = this.props;

    let backgroundColor;
    if (tint === 'dark') {
      backgroundColor = 'rgba(0,0,0,0.5)';
    } else if (tint === 'light') {
      backgroundColor = 'rgba(255,255,255,0.7)';
    } else {
      backgroundColor = 'rgba(255,255,255,0.4)';
    }

    return (
      <View
        {...this.props}
        style={[this.props.style, { backgroundColor }]}
      />
    );
  }
}
