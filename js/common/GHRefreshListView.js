import React, { PropTypes, Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ListView,
  RefreshControl,
  ActivityIndicator
} from 'react-native'
import { getRequest } from '../services/GithubServices'
import { ErrorPlaceholder, LoadingPlaceholder } from '../common/Placeholder'
import { withNavigation } from '@exponent/ex-navigation'

@withNavigation
class GHRefreshListView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
      }),
      loadingErr: null,
      loading: true,
      loaded: false
    }

    this._page = 1
    this._maxPage = this.props.maxPage
    this._loadingPath = null
    this._dataSource = []
    this._reloadData = this._reloadData.bind(this)
    this._appendPage = this._appendPage.bind(this)
    this._renderFooter = this._renderFooter.bind(this)
  }

  componentDidMount() {
    this._reloadData(this.props.path)
  }

  _pageString(path) {
    if (/^http.*/.test(path)) {
      return path
    }

    let p = path
    if (/\w+[?]\w+/.test(path)) {
      p += '&page=' + this._page
    } else {
      p += '?page=' + this._page
    }

    return p
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.filter) {
      const filters = this._dataSource.filter(nextProps.filter)
      this.setState({ dataSource: this.state.dataSource.cloneWithRows(filters), })
    } else {
      if (this.state.dataSource.getRowCount() !== this._dataSource.count) {
        this.setState({ dataSource: this.state.dataSource.cloneWithRows(this._dataSource), })
      }
    }

    if (nextProps.path !== this.props.path) {
      this.setState({ loaded: false, })
      clearTimeout(this._timeoutAction)
      this._timeoutAction = setTimeout(this._reloadData.bind(this, nextProps.path), 1000)
    }
  }

  _reset() {
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
      }),
      loadingErr: null,
      loading: true,
      loaded: false
    }
    this._page = 1
    this._loadingPath = null
    this._maxPage = this.props.maxPage
    this._dataSource = []
  }

  handleError(err) {

  }

  async _reloadData(path) {
    console.log('reload data now', path)
    const { getRowDataArray, navigator } = this.props

    path = path || this.props.path
    if (path === this._loadingPath) return

    this._loadingPath = path
    this._reset()

    try {
      let value
      if (/^http.*/.test(path)) {
        value = await fetch(path)
      } else {
        value = await getRequest(this._pageString(path), { noParse: true })
      }

      // look for the last page
      if (this.props.maxPage === -1) {
        const links = value.headers.map.link && value.headers.map.link[0]
        if (links) {
          const reg = /page=(\d+)\S+\s+rel="last"/g
          const matchs = reg.exec(links)
          const end = matchs && matchs.length && matchs[1]
          if (end) {
            this._maxPage = parseInt(end)
            console.log('this._maxPage is', this._maxPage)
          }
        }
      }

      const res = await value.json()
      // TODO dispatch the needLogin, here need to check if JSON.parse() has error
      if (value.status > 400) {
        if (~res.message.indexOf('rate')) {
          setTimeout(_ => navigator.push('Login'), 2000)
        }

        this.setState({ loadingErr: new Error(res.message) })
        return
      }

      const rows = getRowDataArray && getRowDataArray(res) || res
      this.setState({
        loading: false,
        dataSource: this.state.dataSource.cloneWithRows(rows),
        loaded: true
      })
      this._dataSource = rows

    } catch (err) {
      console.log('err is', err)
      this.setState({ loadingErr: err })
    }
  }

  _appendPage() {
    const { path, getRowDataArray, filter } = this.props

    if (this._page > this._maxPage || filter) return

    this._page++
    const nextPage = this._pageString(path)

    if (this._loadingPath === nextPage) return
    this._loadingPath = nextPage
    console.log('loading next Page is', nextPage)

    getRequest(nextPage)
      .then(res => {
        console.log('next Page is', nextPage)
        console.log('append page value is', res.length)
        const rows = getRowDataArray && getRowDataArray(res) || res
        this._dataSource = this._dataSource.concat(rows)
        this.setState({
          loading: false,
          dataSource: this.state.dataSource.cloneWithRows(this._dataSource)
        })
      })
      .catch(err => {
        console.log('this.err is', err)
        this._page--
      })
  }

  _renderError(err) {
    return <ErrorPlaceholder
      title={err.message}
      desc={'Oops, tap to reload'}
      onPress={this._reloadData.bind(this, this.props.path)}/>
  }

  render() {
    const {
      enablePullToRefresh,
      renderEmptyPlaceholder,
      path,
      enableAppendPage
    } = this.props
    const {
      loadingErr,
      dataSource,
      loaded
    } = this.state

    let content
    if (!loaded) {
      content = <LoadingPlaceholder big={true}/>
    } else if (loadingErr) {
      content = this._renderError(loadingErr)
    } else if (dataSource.getRowCount() === 0) {
      const renderEmpty = renderEmptyPlaceholder || this._renderError.bind(this)
      content = renderEmpty(new Error('Oops! Found nothing'))
    } else {
      let refreshControl
      if (enablePullToRefresh) {
        refreshControl = (
          <RefreshControl
            refreshing={this.state.loading}
            onRefresh={this._reloadData.bind(this, path)}
          />
        )
      }

      const appendPage = enableAppendPage ? this._appendPage : null
      const renderFooter = enableAppendPage ? this._renderFooter : null
      content = (
        <ListView
          {...this.props}
          refreshControl={refreshControl}
          dataSource={dataSource}
          removeClippedSubviews={true}
          renderFooter={renderFooter}
          onEndReached={appendPage}
          scrollRenderAheadDistance={100}
          enableEmptySections={true}
        />
      )
    }

    return <View style={{flex: 1}}>{content}</View>
  }

  _renderFooter() {
    if (this._page >= this._maxPage || this.props.filter) return null
    return (
      <View style={styles.appendLoading}>
        <ActivityIndicator size='small' animating={true}/>
      </View>
    )
  }
}

GHRefreshListView.propTypes = {
  enablePullToRefresh: PropTypes.bool,
  enableAppendPage: PropTypes.bool,
  path: PropTypes.string,
  maxPage: PropTypes.number,
  renderRow: PropTypes.func,
  getRowDataArray: PropTypes.func,
  renderEmptyPlaceholder: PropTypes.func,
  filter: PropTypes.func,
}

GHRefreshListView.defaultProps = {
  enablePullToRefresh: true,
  enableAppendPage: true,
  maxPage: -1,
  parseResponse: false,
}

export default GHRefreshListView

const styles = StyleSheet.create({
  appendLoading: {
    flex: 1,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center'
  },
})