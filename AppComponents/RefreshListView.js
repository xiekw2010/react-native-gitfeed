const React = require('react-native');
const CommonComponents = require('../commonComponents/CommonComponents');
const DXRefreshControl = require('../iosComponents/DXRefreshControl');
const DXTopMessage = require('../iosComponents/DXTopMessage');
const Config = require('../config');
const PropTypes = React.PropTypes;
const GHService = require('../networkService/GithubServices');
const ErrorPlaceholder = require('../commonComponents/ErrorPlacehoderComponent');

const {
  ListView,
  View,
  ActivityIndicatorIOS,
  Text,
  AppRegistry,
} = React;

const LISTVIEWREF = 'listview';
const CONTAINERREF = 'container';

const FloorListView = React.createClass({
  _dataSource: [],

  propTypes: {
    /**
     * return a reloadPromise
     */
    reloadPromise: PropTypes.func,
    /**
     * return an array of handled data, (value) => {}
     */
    handleReloadData: PropTypes.func,
    /**
     * return an append promise
     */
    appendPromise: PropTypes.func,
    /**
     * return an array of handled data, (value) => {}
     */
    handleAppendData: PropTypes.func,
    /**
     * return if need to load needPage
     */
    needNextPage: PropTypes.func,
    /**
     * render the row, like ListView
     */
    renderRow: PropTypes.func,
    /**
     * handle the load error ({isReloadError: false, error: null}) => {}
     */
    handleError: PropTypes.func,
  },

  getInitialState() {
    const dataSourceParam = {
      rowHasChanged: (row1, row2) => row1 !== row2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    }

    return {
      dataSource: new ListView.DataSource(dataSourceParam),
      loaded: false,
      lastError: {isReloadError: false, error: null},
    };
  },

  _isPromise(pPromise)  {
    return !!pPromise.then && typeof pPromise.then === 'function';
  },

  showError(error) {
    DXTopMessage.showTopMessage(
      this.refs[CONTAINERREF],
      error.toString(),
      {offset: 64.0}, () => {}
    );
  },

  componentDidMount() {
    this.reloadData();
  },

  reloadDataIfNeed() {
    if (this._dataSource.length == 0) {
      this.reloadData();
    }
  },

  clearData() {
    this._dataSource = [];
    this._setNeedsRenderList([]);
  },

  reloadData() {
    this.setState({
      lastError: {isReloadError: false, error: null},
    });
    _dataSource = [];
    const reloadPromise = this.props.reloadPromise();
    if (!this._isPromise(reloadPromise)) return;

    reloadPromise
      .then(value => {
        const rdata = this.props.handleReloadData(value);
        this._setNeedsRenderList(rdata);
      })
      .catch(err => {
        this.showError(err);
        const pError = {
          loaded: true,
          lastError: {isReloadError: true, error: err},
        };
        this.props.handleError && this.props.handleError(pError);
        this.setState(pError);
      })
      .done(() => {
        const node = this.refs[LISTVIEWREF];
        if (node) {
          DXRefreshControl.endRefreshing(node);
        }
      })
  },

  appendPage() {
    if (!this.props.needNextPage || !this.props.needNextPage()) return;

    console.log('append Page');
    const appendPromise = this.props.appendPromise();
    if (!this._isPromise(appendPromise)) return;

    appendPromise
     .then(value => {
       const rdata = this.props.handleAppendData(value);
       this._setNeedsRenderList(rdata);
     })
     .catch(err => {
       this.showError(err);
       const pError = {
         loaded: true,
         lastError: {isReloadError: false, error: err},
       };
       this.props.handleError && this.props.handleError(pError);
       this.setState(pError);
     })
  },

  _setNeedsRenderList(rdata) {
    _dataSource.push(...rdata);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(_dataSource),
      loaded: true,
    });
  },

  componentDidUpdate(prevProps, prevState) {
    let node = this.refs[LISTVIEWREF];
    if (!node) return;

    DXRefreshControl.configureCustom(node, {
      headerViewClass: 'UIRefreshControl',
    }, this.reloadData);
  },

  render() {
    if (!this.state.loaded) {
      return CommonComponents.renderLoadingView();
    }

    if (this.state.lastError.isReloadError) {
      return (
        <ErrorPlaceholder
          title={this.state.lastError.error.message}
          desc={'Oops, tap to reload'}
          onPress={this.reloadData}/>
      );
    }
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
          contentInset={{top: 64, left: 0, bottom: 49, right: 0}}
          contentOffset={{x:0, y:-64}}
          scrollRenderAheadDistance={50}
          {...this.props}
        />
      </View>
    );


    /* 在RN 15里面需要这样
    contentInset={{top: 64, left: 0 , bottom: 49, right: 0}}
    contentOffset={{x:0, y:-64}}
    */
  },

  renderFooter() {
    const lastError = this.state.lastError;
    if (this.props.needNextPage() && !lastError.error) {
      return (
        <View style={{
            flex: 1,
            alignItems: 'center',
            height: 40,
            justifyContent: 'center'}} >
          <ActivityIndicatorIOS size='small' />
        </View>
      )
    }
  },
});

module.exports = FloorListView;
