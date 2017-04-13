'use strict'

import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  Text,
  View,
  Platform
} from 'react-native'
import { addRecent } from '../actions/recent'
import { connect } from 'react-redux'

import Color from '../common/Colors'
import GridView from '../common/GridView'
import PicCell from '../common/PicCell'
import Dimensions from 'Dimensions'

const SCREENWIDTH = Dimensions.get('window').width
const PICS_PER_ROW = 3
const PICCELL_WIDTH = SCREENWIDTH / 3
const NAV_HEIGHT = Platform.OS === 'android' ? 44 : 64

class DetailPage extends Component {
  componentDidMount() {
    const { dispatch, context } = this.props
    dispatch(addRecent(context))
  }

  render() {
    return (
      <GridView
        items={this.props.context.pics}
        itemsPerRow={PICS_PER_ROW}
        renderItem={this._renderItem.bind(this)}
        style={styles.gridView}
      />
    )
  }

  _renderItem(item, index, rowID) {
    const key = index + PICS_PER_ROW * rowID
    return (
      <PicCell
        key={key}
        uri={item}
        size={{ height: PICCELL_WIDTH, width: PICCELL_WIDTH }}
        navigator={this.props.navigator}
        onSelect={this._onSelect.bind(this, item, key)}
      />)
  }

  _onSelect(item, key) {
    this.props.navigator.push({
      id: 'ShareLookPage',
      title: this.props.context.title || '天天表情',
      context: {
        detail: this.props.context,
        selectIndex: key
      }
    })
  }
}

DetailPage.propTypes = {
  context: PropTypes.object
}
DetailPage.defaultProps = {}

export default connect()(DetailPage)

const styles = StyleSheet.create({
  gridView: {
    marginTop: NAV_HEIGHT,
    backgroundColor: Color.gridViewBack
  },
  loadingView: {
    justifyContent: 'center',
    alignItems: 'center'
  }
})
