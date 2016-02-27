const React = require('react-native');
const Icon = require('react-native-vector-icons/Ionicons');
const Colors = require('../commonComponents/Colors');
const GHService = require('../networkService/GithubServices');
const UserList = require('./UserListComponent');
const DXRNUtils = require('../commonComponents/DXRNUtils');
const CommonComponents = require('../AppComponents/GithubWebComponent');
const Platform = require('Platform');

const {
  StyleSheet,
  WebView,
  View,
  TouchableOpacity,
  Text,
  Image,
  ActionSheetIOS,
  ProgressBarAndroid,
  ActivityIndicatorIOS
} = React;

const hideJS = `
  ;(function GHHide() {
    var args = Array.prototype.slice.call(arguments);
    for (var i = 0; i < args.length; i++) {
      var className = args[i];
      try {
        document.getElementsByClassName(className)[0].style.display="none";
      } catch (e){};
    }
  })('nav-bar',
     'breadcrumb blob-breadcrumb',
     'discussion-block-header',
     'discussion-reply-container',
     'discussion-block-header',
     'thread-subscription-status',
     'clearfix',
     'follow'
     );
`;

const GithubWebComponent = React.createClass({
  _isRepo: false,
  _debugTime: 0,

  PropTypes: {
    webURL: React.PropTypes.string,
    param: React.PropTypes.object,
  },

  getInitialState() {
    let url = this.props.webURL;
    if (url && !url.match(/^[a-zA-Z]+:\/\//)) {
        url = 'http://' + url;
    }

    return {
      URL: url,
      backAble: false,
      forwardAble: false,
      refreshAble: false,
    }
  },

  onNavigationStateChange(e) {
    console.log(e.url + 'loading takes' + (Date.now() - this._debugTime) / 1000 + 's');
    this._debugTime = Date.now();

    const title = e.title;
    const URLNeedChanged = title.indexOf('Page not found') >= 0 && this._isRepo;
    let url = e.url;
    if (URLNeedChanged) {
      const repoName = this.props.param.full_name || this.props.param.name;
      const path = GHService.apiPath() + '/repos/' + repoName + '/readme';
      GHService.fetchPromise(path)
        .then(value => {
          console.log('web value is', value);
          if (value.status < 400) {
            const json = JSON.parse(value._bodyInit);
            const fixURL = json.html_url;

            if (fixURL) {
              this.setState({
                URL: fixURL,
                backAble: e.canGoBack,
                forwardAble: e.canGoForward,
                refreshAble: !e.loading && title.length > 0
              });
            }
          }
        })
    } else {
      this.setState({
        URL: url,
        backAble: e.canGoBack,
        forwardAble: e.canGoForward,
        refreshAble: !e.loading && title.length > 0
      });
    }
  },

  onShare() {
    DXRNUtils.trackClick('clickWebShare', {name: 'web 点击分享:' + this.state.URL});
    const message = '';

    ActionSheetIOS.showShareActionSheetWithOptions({
      message: message,
      url: this.state.URL,
    },
    () => {},
    () => {});
  },

  componentWillMount() {
    this._debugTime = Date.now();

    const originURL = this.props.webURL;
    const isRepo = originURL && originURL.indexOf('/blob/master') > 0;
    this._isRepo = isRepo;

    this.props.route.onShare = this.onShare;
  },

  renderLoading() {
    if (Platform.OS === 'android') {
      return (
        <View style={styles.container}>
          <ProgressBarAndroid styleAttr="Inverse" style='Large'/>
        </View>
      )
    } else if (Platform.OS === 'ios') {
      return (
        <View style={styles.container}>
          <ActivityIndicatorIOS size="large" />
        </View>
      );
    }
  },

  render() {
    console.log('render web');
    let repoToolBar;
    let topInset = 64;
    if (this._isRepo) {
      repoToolBar = <RepoToolBar
                      URL={this.props.param.url}
                      navigator={this.props.navigator}/>;
      topInset = 0;
    }

    let webToolBar;
    if (this.state.backAble || this.state.forwardAble) {
      webToolBar = (
        <WebToolBar
          goBack={() => this.webView.goBack()}
          goForward={() => this.webView.goForward()}
          onRefresh={() => this.webView.reload()}
          backAble={this.state.backAble}
          forwardAble={this.state.forwardAble}
          refreshAble={this.state.refreshAble}
        />
      )
    }

    return (
      <View style={{flex: 1}}>
        {repoToolBar}
        <WebView
          ref={(webView) => this.webView = webView}
          styles={{flex: 1}}
          url={this.state.URL}
          onNavigationStateChange={this.onNavigationStateChange}
          injectedJavaScript={hideJS}
          automaticallyAdjustContentInsets={false}
          contentInset={{top: topInset, left: 0, bottom: 49, right: 0}}
          renderLoading={this.renderLoading}
          javaScriptEnabled={true}
          startInLoadingState={true}>
        </WebView>
        {webToolBar}
      </View>
    )
  },
});

const RepoToolBar = React.createClass({
  _repoRes: {
    full_name: null,
    subscribers_url: null,
    stargazers_url: null,
  },

  PropTypes: {
    URL: React.PropTypes.string,
  },

  getInitialState() {
    return {
      watchNumber: '...',
      starNumber: '...',
      forkNumber: '...',
      watchStatus: 'Watch',
      starStatus: 'Star',
    }
  },

  componentDidMount() {
    GHService.fetchPromise(this.props.URL)
      .then(value => {
        console.log('value', value);
        const res = JSON.parse(value._bodyInit);
        if (!res) return;

        this.setState({
          watchNumber: res.subscribers_count,
          starNumber: res.stargazers_count,
          forkNumber: res.forks_count,
        });
        this._repoRes = res;

        if (GHService.isLogined()) {
          const pms = [
            GHService.repoWatchQuery(this._repoRes.full_name),
            GHService.repoStarQuery(this._repoRes.full_name)
          ];

          return Promise.all(pms);
        } else {
          return null;
        }
      })
      .then(value => {
        if (!value) return;

        console.log('pm all', value);
        let watchStatus;
        let starStatus;
        value.forEach((res, idx) => {
          const status = res.status;
          if (idx === 0) {
            watchStatus = status < 400 ? 'Unwatch' : 'Watch';
          } else if (idx === 1) {
            starStatus = status < 400 ? 'Unstar' : 'Star';
          }
        });
        this.setState({
          watchStatus: watchStatus,
          starStatus: starStatus,
        });
      })
      .catch(err => {
        console.log('WebCompononent Error', err);
      })
  },

  onPressWatch() {
    const fullName = this._repoRes.full_name;
    if (!fullName) return;

    const isWatch = this.state.watchStatus == 'Unwatch';
    const toggleAction = isWatch ? 'DELETE' : 'PUT';
    const watchQuery = (() => {
      GHService.repoWatchQuery(fullName, toggleAction)
        .then(value => {
          console.log('watch response', value);
          const status = value.status;
          const isNowStar = this.state.watchStatus == 'Unwatch';
          const starStatus = isNowStar ? 'Watch' : 'Unwatch';
          const toggleCount = isNowStar ? -1 : 1;

          if (status < 400) {
            this.setState({
              watchStatus: starStatus,
              watchNumber: this.state.watchNumber + toggleCount
            });
          }
        });
    });

    GHService.checkNeedLoginWithPromise(watchQuery, this.props.navigator);

    DXRNUtils.trackClick('clickWebWatchRepo', {name: 'web点击Watch'});
  },

  onPressWatchers() {
    const url = this._repoRes.subscribers_url;
    if (!url) return;

    const user = {
      url: url,
      title: 'Watchers',
    }
    this.props.navigator.push({id: 'userList', obj: user});

    DXRNUtils.trackClick('clickWebWatchList', {name: 'web点击WatchUserList'});
  },

  onPressStar() {
    const fullName = this._repoRes.full_name;
    if (!fullName) return;

    const isStar = this.state.starStatus == 'Unstar';
    const toggleAction = isStar ? 'DELETE' : 'PUT';
    const starQuery = () => {
      GHService.repoStarQuery(fullName, toggleAction)
        .then(value => {
          const status = value.status;
          const isNowStar = this.state.starStatus == 'Unstar';
          const starStatus = isNowStar ? 'Star' : 'Unstar';
          const toggleCount = isNowStar ? -1 : 1;

          if (status < 400) {
            this.setState({
              starStatus: starStatus,
              starNumber: this.state.starNumber + toggleCount
            });
          }
        });
    };

    GHService.checkNeedLoginWithPromise(starQuery, this.props.navigator);

    DXRNUtils.trackClick('clickWebStarRepo', {name: 'web点击Star'});
  },

  onPressStarers() {
    const url = this._repoRes.stargazers_url;
    if (!url) return;

    const user = {
      url: url,
      title: 'Stargazers',
    }
    this.props.navigator.push({id: 'userList', obj: user});

    DXRNUtils.trackClick('clickWebStarList', {name: 'web点击StarUserList'});
  },

  render() {
    console.log('user is', this._repoRes);
    const owner = this._repoRes && this._repoRes.owner;
    let userCp;
    if (owner) {
      userCp = (
        <TouchableOpacity onPress={() => {
          DXRNUtils.trackClick('clickWebRepoOwner', {name: 'web点击repoOwner'});

          const type = owner.type;
          if (type == 'User') {
            this.props.navigator.push({id: 'user', obj: owner});
          } else {
            this.props.navigator.push({id: 'org', obj: owner});
          }
        }}>
          <View style={styles.repoUser}>
            <Image
               style={styles.repoAvatar}
               source={{uri: owner.avatar_url}}/>
             <Text style={[styles.actionText, {marginRight: 20}]}>{owner.login}</Text>
          </View>
        </TouchableOpacity>
      )
    }

    let top = 64;
    if (Platform.OS === 'android') {
      top = 44;
    }

    return (
      <View style={[styles.repoToolBar, {marginTop: top}]}>
        {userCp}
        <ActionComponent
          iconName={'eye'}
          actionName={this.state.watchStatus}
          actionNumber={this.state.watchNumber}
          onPressAction={this.onPressWatch}
          onPressNumbers={this.onPressWatchers}
        />
        <ActionComponent
          iconName={'ios-star'}
          actionName={this.state.starStatus}
          actionNumber={this.state.starNumber}
          onPressAction={this.onPressStar}
          onPressNumbers={this.onPressStarers}
        />
      </View>
    )
  }
});

const ActionComponent = React.createClass({
  PropTypes: {
    iconName: React.PropTypes.string,
    actionName: React.PropTypes.string,
    actionNumber: React.PropTypes.string,
    onPressAction: React.PropTypes.func,
    onPressNumbers: React.PropTypes.func,
  },
  render() {
    return (
      <View style={styles.action}>
        <TouchableOpacity
          onPress={this.props.onPressAction}
          >
          <View style={styles.leftAction}>
            <Icon
              name={this.props.iconName}
              size={20}
              style={{width: 20, height: 20}}
              color={Colors.black}
            />
            <Text style={styles.actionText}>
              {this.props.actionName}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={this.props.onPressNumbers}
          style={styles.rightAction}>
          <Text style={[styles.actionText, {marginTop: 2}]}>
            {this.props.actionNumber}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
});

const iconSize = 30;
const WebToolBar = React.createClass({
  PropTypes: {
    goBack: React.PropTypes.func,
    goForward: React.PropTypes.func,
    onRefresh: React.PropTypes.func,
    backAble: React.PropTypes.bool,
    forwardAble: React.PropTypes.bool,
    refreshAble: React.PropTypes.bool,
  },

  goBack() {
    this.props.backAble && this.props.goBack && this.props.goBack();
  },

  goForward() {
    this.props.forwardAble && this.props.goForward && this.props.goForward();
  },

  onRefresh() {
    this.props.refreshAble && this.props.onRefresh && this.props.onRefresh();
  },

  render() {
    const backOpacity = this.props.backAble ? 0.5 : 1.0;
    const backColor = this.props.backAble ? Colors.blue : 'lightGray';

    const forwardOpacity = this.props.forwardAble ? 0.5 : 1.0;
    const forwardColor = this.props.forwardAble ? Colors.blue : 'lightGray';

    const refreshOpacity = this.props.refreshAble ? 0.5 : 1.0;
    const refreshColor = this.props.refreshAble ? Colors.blue : 'lightGray';

    let bottom = 49;
    if (Platform.OS === 'android') {
      bottom = 0;
    }

    return (
      <View style={[styles.webViewToolBar, {bottom: bottom}]}>
        <View style={styles.webLeft}>
          <TouchableOpacity
            style={{marginRight: 15}}
            onPress={this.props.goBack}
            activeOpacity={backOpacity}>
            <Icon
              name='android-arrow-back'
              size={iconSize}
              style={styles.icon}
              color={backColor}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{marginLeft: 15}}
            onPress={this.props.goForward}
            activeOpacity={forwardOpacity}>
            <Icon
              name='android-arrow-forward'
              size={iconSize}
              style={styles.icon}
              color={forwardColor}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{marginRight: 15}}
          onPress={this.props.onRefresh}
          activeOpacity={refreshOpacity}>
          <Icon
            name='android-refresh'
            size={iconSize}
            style={styles.icon}
            color={refreshColor}
          />
        </TouchableOpacity>
      </View>
    )
  }
});

var styles = StyleSheet.create({
  repoToolBar: {
    backgroundColor: '#FAFAFA',
    height: 40,
    marginTop: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#F2F2F2',
    shadowColor: '#ccc',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  action: {
    borderStyle: 'solid',
    borderColor: '#F2F2F2',
    borderRadius: 3,
    flexDirection: 'row',
    marginRight: 20,
    shadowColor: '#ccc',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 3,
    backgroundColor: "#F2F2F2",
  },
  repoUser: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  repoAvatar: {
    width: 30,
    height: 30,
    backgroundColor:'lightGray',
    borderRadius: 2,
  },
  leftAction: {
    padding: 3,
    backgroundColor: "#F2F2F2",
    flexDirection: 'row'
  },
  rightAction: {
    padding: 3,
    backgroundColor: "white",
  },
  actionText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  webViewToolBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    height: 40,
    position: 'absolute',
    left: 0,
    bottom: 49,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  webLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  icon: {
    width: iconSize,
    height: iconSize,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

module.exports = GithubWebComponent;
