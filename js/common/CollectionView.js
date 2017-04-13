/**
 * Created by xiekaiwei on 16/8/28.
 */

'use strict'

import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ActivityIndicator
} from 'react-native'
import GridView from './GridView'
import PicCell from './PicCell'
import Dimensions from 'Dimensions'
import Color from './Colors'
import ErrorPlaceholder from './ErrorPlacehoder'
import Pagination from './Pagination'

const TimerMixin = require('react-timer-mixin')
const SCREENWIDTH = Dimensions.get('window').width
const PICS_PER_ROW = 3
const PICCELL_WIDTH = SCREENWIDTH / PICS_PER_ROW

const TRANSFER_PARSE_LOOK = obj => obj.toJSON()

// TODO: 更好的支持 SearchPage, 展示 loading 与 error placehodler
export default React.createClass({
  _pagination: new Pagination(100),

  propTypes: {
    // 加载数据的 parse query
    query: React.PropTypes.object,
    enablePullToRefresh: React.PropTypes.bool,
    picsPerRow: React.PropTypes.number,
    renderItem: React.PropTypes.func,
    onChangeDataSource: React.PropTypes.func,
    cellSize: React.PropTypes.number
  },

  mixins: [TimerMixin],

  getDefaultProps() {
    return {
      enablePullToRefresh: true,
      picsPerRow: PICS_PER_ROW,
      onChangeDataSource: _ => {},
      cellSize: PICCELL_WIDTH
    }
  },

  getInitialState() {
    return {
      dataSource: [],
      refreshing: false,
      loadingErr: null,
      randomImageIndex: 0,
    }
  },

  componentDidMount() {
    this._fetchData(this.props.query)
  },

  render() {
    const {
      enablePullToRefresh,
      picsPerRow,
      renderItem,
      query,
    } = this.props
    const { dataSource } = this.state

    const renderCell = renderItem || this._renderItem
    const hasContent = dataSource.length > 0
    if (hasContent) {
      let refreshControl
      if (enablePullToRefresh) {
        refreshControl = (
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._fetchData.bind(this, query)}
          />
        )
      }

      return (
        <GridView
          {...this.props}
          refreshControl={refreshControl}
          items={dataSource}
          itemsPerRow={picsPerRow}
          renderItem={renderCell}
          style={[styles.gridView, this.props.style]}
          removeClippedSubviews={true}
          renderFooter={this._renderFooter}
          onEndReached={this._appendPage}
          scrollRenderAheadDistance={100}
          enableEmptySections={true}
        />
      )
    } else {
      if (this.state.loadingErr) {
        return this._renderErrorPlaceholder()
      } else {
        return this._renderLoadingView()
      }
    }
  },

  _fetchData(query) {
    this.setState({
      refreshing: true,
      loadingErr: null
    })

    this._pagination.reset()

    if (!query) query = this.props.query

    query.skip(this._pagination.step)
    query.find()
      .then(res => {
        let err
        if (!res.length) {
          this._pagination.close()
          err = new Error('')
        } else {
          this._pagination.incrStep()
        }

        this.setState({
          dataSource: res.map(TRANSFER_PARSE_LOOK),
          refreshing: false,
          loadingErr: err,
          randomImageIndex: randomIndex(10)
        })
        this.props.onChangeDataSource(this.state.dataSource)
      })
      .catch(err => {
        console.log('collection view fetch data err', err)
        this.setState({
          dataSource: [],
          loadingErr: err
        })
        this.props.onChangeDataSource(this.state.dataSource)
      })
  },

  _appendPage() {
    const { hasMore, step, loadingStep } = this._pagination

    if (!hasMore) return
    if (step === loadingStep) return

    this._pagination.incrLoadingStep()

    const query = this.props.query
    query.skip(step)
    query.find()
      .then(res => {
        this.setState({
          dataSource: this.state.dataSource
            .concat(res.map(TRANSFER_PARSE_LOOK)),
        })
        if (!res.length) {
          this._pagination.close()
        } else {
          this._pagination.incrStep()
        }
        this.props.onChangeDataSource(this.state.dataSource)
      })
      .catch(err => {
        console.log('err is', err)
        this._pagination.decrLoadingStep()
      })
  },

  _renderLoadingView() {
    return (
      <View style={styles.loadingView}>
        <ActivityIndicator
          style={{ marginTop: 20 }}
          size='large'
          animating={true}/>
      </View>
    )
  },

  _renderFooter() {
    const { hasMore, step, loadingStep } = this._pagination

    if (!hasMore || step === loadingStep) return null
    return (
      <View style={styles.appendLoading}>
        <ActivityIndicator size='small' animating={true}/>
      </View>
    )
  },

  _renderErrorPlaceholder() {
    const { loadingErr } = this.state
    const msg = loadingErr && loadingErr.message || ''
    return (
      <ErrorPlaceholder
        desc={msg}
        title={'亲, 暂时还没有这个表情哦'}
        onPress={this._fetchData.bind(this, this.props.query)}
      />
    )
  },

  _onSelectCell(index) {
    const detail = this.state.dataSource[index]
    this.requestAnimationFrame(() => {
      this.props.navigator.push({
        id: 'ShareLookPage',
        title: detail && detail.title || '',
        context: {
          detail,
          selectIndex: this.state.randomImageIndex
        }
      })
    })
  },

  _renderItem(item, index, rowID) {
    const key = index + PICS_PER_ROW * rowID
    const pics = item.pics
    const { cellSize } = this.props
    return (
      <PicCell
        key={item.title}
        uri={this._getRandomPic(pics)}
        size={{ height: cellSize, width: cellSize }}
        onSelect={this._onSelectCell.bind(this, key)}
        navigator={this.props.navigator}
      />
    )
  },

  _getRandomPic(pics) {
    let { randomImageIndex } = this.state
    if (randomImageIndex > pics.length) {
      randomImageIndex = 0
    }

    return pics[randomImageIndex]
  }
})

// eg randomIndex(10), get [0, ...9]
const randomIndex = length => Math.floor(Math.random() * length)

const styles = StyleSheet.create({
  gridView: {
    paddingTop: 5,
    backgroundColor: Color.gridViewBack,
  },
  loadingView: {
    marginTop: 64,
    justifyContent: 'center',
    alignItems: 'center'
  },
  appendLoading: {
    flex: 1,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center'
  },
  errContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  }
})
