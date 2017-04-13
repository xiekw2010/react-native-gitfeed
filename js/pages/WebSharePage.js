'use strict'

import React, {
  Component,
  PropTypes,
} from 'react'
import {
  Platform
} from 'react-native'
import WebView from '../common/WebView'

const NAV_HEIGHT = 64
class WebSharePage extends Component {
  render() {
    return (
      <WebView
        webURL={this.props.url}
        style={{ marginTop: NAV_HEIGHT }}
        startInLoadingState={true}
      />
    )
  }
}

WebSharePage.propTypes = {
  url: PropTypes.string
}
WebSharePage.defaultProps = {
  url: 'http://bonwechat.com'
}

export default WebSharePage
