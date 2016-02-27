const React = require('react-native');
const CommonComponents = require('../commonComponents/CommonComponents');
const DXRefreshControl = require('../iosComponents/DXRefreshControl');
const Config = require('../config');
const PropTypes = React.PropTypes;
const GHService = require('../networkService/GithubServices');
const ErrorPlaceholder = require('../commonComponents/ErrorPlacehoderComponent');
const Platform = require('Platform');

const {
  ListView,
  View,
  ActivityIndicatorIOS,
  Text,
  AppRegistry,
  Navigator,
  PullToRefreshViewAndroid,
  ProgressBarAndroid,
  StyleSheet,
} = React;

const LISTVIEWREF = 'listview';
const CONTAINERREF = 'container';

const FloorListView = React.createClass({
  _dataSource: [],
  _page: 1,
  _maxPage: -1,
  _loading: false,
  _loaded: false,
  _loadPath: null,

  propTypes: {
    enablePullToRefresh: PropTypes.bool,
    /**
     * return a reloadPromise path
     */
    reloadPromisePath: PropTypes.func,
    /**
     * return an array of handled data, (value) => {}
     */
    handleReloadData: PropTypes.func,
    /**
     * render the row, like ListView
     */
    renderRow: PropTypes.func,
    /**
     * context object
     */
    context: PropTypes.func,
    /**
     * Error holder (error) => {}
     */
    renderErrorPlaceholder: PropTypes.func,
    /**
     * Max page for a list
     */
    maxPage: PropTypes.number,
  },

  getInitialState() {
    this._maxPage = this.props.maxPage || -1;
    this._loaded = false;

    const dataSourceParam = {
      rowHasChanged: (row1, row2) => row1 !== row2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    }

    return {
      dataSource: new ListView.DataSource(dataSourceParam),
      loaded: true,
      lastError: {isReloadError: false, error: null},
      isRefreshing: false,
    };
  },

  componentDidMount() {
    this.reloadData();
  },

  reloadDataIfNeed() {
    const pathChanged = this._loadPath != this.props.reloadPromisePath();
    if (this._dataSource.length == 0 || pathChanged) {
      this.reloadData();
    }
  },

  clearData() {
    this._dataSource = [];
    this._setNeedsRenderList([]);
    this._page = 1;
    this._maxPage = 1;
    this._loading = false;
  },

  _pageString(path) {
    const testReg = /\w+[?]\w+/;
    if (testReg.test(path)) {
      path += '&page=' + this._page;
    } else {
      path += '?page=' + this._page;
    }

    return path;
  },

  reloadData() {
    let path = this.props.reloadPromisePath();
    this._loadPath = path;

    if (!path || this._loading) return;

    this._loading = true;
    this.setState({
      lastError: {isReloadError: false, error: null},
      loaded: this.state.dataSource.getRowCount() > 0,
      isRefreshing: true,
    });
    this._dataSource = [];
    this._page = 1;

    path = this._pageString(path);
    const reloadPromise = GHService.fetchPromise(path);
    reloadPromise
      .then(value => {
        // look for the last page
        if (this._maxPage == -1) {
          const links = value.headers.map.link && value.headers.map.link[0];
          if (links) {
            const reg = /page=(\d+)\S+\s+rel="last"/g;
            const matchs = reg.exec(links);
            const end = matchs[1];
            if (end) {
              this._maxPage = end;
            }
          }
        }

        if (value.status > 400) {
          const body = JSON.parse(value._bodyInit);
          const needLogin = body.message.indexOf('rate') != -1;
          if (needLogin) {
            this.props.navigator.push({
              id: 'login',
              title: 'API rate need login',
              sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
            });
          }
        }

        const rdata = this.props.handleReloadData(value);
        this._setNeedsRenderList(rdata);

        if (this._dataSource.length == 0) {
          throw new Error('Not Found');
        }
      })
      .catch(err => {
        const pError = {
          loaded: true,
          lastError: {isReloadError: true, error: err},
        };
        this.props.handleError && this.props.handleError(pError);
        this.setState(pError);
      })
      .done(() => {
        const node = this.refs[LISTVIEWREF];
        if (node && this.props.enablePullToRefresh) {
          DXRefreshControl.endRefreshing(node);
        }

        this._loading = false;
        this.setState({
          isRefreshing: false,
        });
      })
  },

  appendPage() {
    if (this._page > this._maxPage) return;

    this._page ++;

    let path = this.props.reloadPromisePath();
    if (!path) return;

    path = this._pageString(path);
    console.log('appendPage path', path);
    const appendPromise = GHService.fetchPromise(path);
    appendPromise
     .then(value => {
       const rdata = this.props.handleReloadData(value);
       this._setNeedsRenderList(rdata);
     })
     .catch(err => {
       this.showError(err);

       const pError = {
         loaded: true,
         lastError: {isReloadError: false, error: err},
       };
       this.setState(pError);
       this._page --;

       this.props.handleError && this.props.handleError(pError);
     })
  },

  _setNeedsRenderList(rdata) {
    this._dataSource.push(...rdata);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this._dataSource),
      loaded: true,
    });
  },

  componentDidUpdate(prevProps, prevState) {
    let node = this.refs[LISTVIEWREF];
    if (!node || !this.props.enablePullToRefresh) return;

    DXRefreshControl.configureCustom(node, {
      headerViewClass: 'UIRefreshControl',
    }, this.reloadData);
  },

  render() {
    if (!this.state.loaded) {
      return CommonComponents.renderLoadingView();
    }

    if (this.state.lastError.isReloadError) {
      const error = this.state.lastError.error;
      if (this.props.renderErrorPlaceholder) {
        return this.props.renderErrorPlaceholder(error);
      } else {
        return (
          <ErrorPlaceholder
            title={error.message}
            desc={'Oops, tap to reload'}
            onPress={this.reloadData}/>
        );
      }
    }

    if (Platform.OS === 'android') {
      return (
        <PullToRefreshViewAndroid
          style={[{flex: 1}, this.props.style]}
          refreshing={this.state.isRefreshing}
          onRefresh={this.reloadData}
          >
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.props.renderRow}
            removeClippedSubviews={true}
            renderFooter={this.renderFooter}
            onEndReached={this.appendPage}
            scrollRenderAheadDistance={50}
            {...this.props}
            style={{flex: 1}}
            >
          </ListView>
        </PullToRefreshViewAndroid>
      );
    } else if (Platform.OS === 'ios') {
      return (
        <View style={{flex: 1, backgroundColor: 'white'}} ref={CONTAINERREF}>
          <ListView
            ref={LISTVIEWREF}
            dataSource={this.state.dataSource}
            renderRow={this.props.renderRow}
            removeClippedSubviews={true}
            renderFooter={this.renderFooter}
            onEndReached={this.appendPage}
            automaticallyAdjustContentInsets={false}
            contentInset={{top: 0, left: 0, bottom: 49, right: 0}}
            contentOffset={{x:0, y: 0}}
            scrollRenderAheadDistance={50}
            {...this.props}
          />
        </View>
      );
    }
  },

  renderFooter() {
    const lastError = this.state.lastError;
    if (this._maxPage > this._page && !lastError.error) {
      if (Platform.OS === 'android') {
        return (
          <View style={styles.appendLoading}>
            <ProgressBarAndroid styleAttr="Small"/>
          </View>
        );
      } else if (Platform.OS === 'ios') {
        return (
          <View style={styles.appendLoading}>
            <ActivityIndicatorIOS size='small'/>
          </View>
        )
      }
    }
  },
});

var styles = StyleSheet.create({
  appendLoading: {
    flex: 1,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center'
  }
});

module.exports = FloorListView;
