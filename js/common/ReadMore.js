import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  View,
  Image,
  TouchableHighlight,
  TouchableOpacity
} from 'react-native'
import Colors from '../constants/Colors'
import { Text, LinkText, NormalText, Heading2 } from '../common/F8Text'
import ReadMore from '@exponent/react-native-read-more-text'


class RM extends Component {
  _renderTruncatedFooter(handlePress) {
    return (
      <Text style={{ marginTop: 5, color: Colors.textLink}}
            onPress={handlePress}>
        Read more
      </Text>
    )
  }

  _renderRevealedFooter(handlePress) {
    return (
      <Text style={{ marginTop: 5, color: Colors.textLink}}
            onPress={handlePress}>
        Show less
      </Text>
    )
  }

  render() {
    const { lines, content } = this.props
    return (
      <ReadMore
        numberOfLines={lines}
        renderTruncatedFooter={this._renderTruncatedFooter.bind(this)}
        renderRevealedFooter={this._renderRevealedFooter.bind(this)}>
        <Text style={[
          {
            marginTop: 3,
            color: Colors.textGray
          },
          this.props.style]}
              numberOfLines={0}>
          {content}
        </Text>
      </ReadMore>
    )
  }
}

RM.propTypes = {
  lines: PropTypes.number,
}
RM.defaultProps = {
  lines: 3
}

export default RM
