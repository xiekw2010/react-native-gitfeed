'use strict'

import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  Text,
  View,
} from 'react-native'

import Color from '../common/Colors'
import GridView from '../common/GridView'
import PicCell from '../common/PicCell'
import Dimensions from 'Dimensions'

const reactMixin = require('react-mixin')
const TimerMixin = require('react-timer-mixin')

const SCREEN_WIDTH = Dimensions.get('window').width
const PICS_PER_ROW = 3
const CELL_SIZE = SCREEN_WIDTH / 3

class GridPage extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <GridView
        {...this.props}
        items={this.props.dataSource}
        itemsPerRow={PICS_PER_ROW}
        renderItem={this._renderItem.bind(this)}
        style={[styles.gridView, this.props.style]}
        enableEmptySections={true}
      />
    )
  }

  _renderItem(item, index, rowID) {
    const displayIndex = item.displayIndex || 0
    return (
      <PicCell
        key={item.title}
        uri={item.pics[displayIndex]}
        size={{ height: CELL_SIZE, width: CELL_SIZE }}
        onSelect={this._onSelect.bind(this, item)}
        navigator={this.props.navigator}
      />
    )
  }

  _onSelect(detail) {
    this.requestAnimationFrame(() => {
      this.props.navigator.push({
        id: 'ShareLookPage',
        title: detail.title,
        context: {
          detail,
          selectIndex: detail.displayIndex || 0
        }
      })
    })
  }
}

GridPage.propTypes = {
  dataSource: PropTypes.array.isRequired
}

GridPage.defaultProps = {
  dataSource: []
}

reactMixin(GridPage.prototype, TimerMixin)

export default GridPage

const styles = StyleSheet.create({
  gridView: {
    backgroundColor: Color.gridViewBack
  },
  loadingView: {
    justifyContent: 'center',
    alignItems: 'center'
  }
})
