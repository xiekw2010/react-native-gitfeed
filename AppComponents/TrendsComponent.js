const React = require('react-native');
const GHService = require('../networkService/GithubServices');
const CommonComponents = require('../commonComponents/CommonComponents');
const Colors = require('../commonComponents/Colors');
const SettingComponent = require('./SettingsCell');
const ScrollableTabView = require('react-native-scrollable-tab-view');
const DefaultTabBar = require('./DefaultTabBar');
const GHRefreshListView = require('./GHRefreshListView');
const UserCell = require('./UserCell');
const ErrorPlaceholder = require('../commonComponents/ErrorPlacehoderComponent');
const LanguageComponent = require('./LanguageComponent');
const ExploreCell = require('./ExploreCell');
const Countries = require('../commonComponents/Countries.json');
const DXRNUtils = require('../commonComponents/DXRNUtils');
const Languages = require('../commonComponents/LanguageList');
const Platform = require('Platform');

const {
  View,
  ActivityIndicatorIOS,
  Text,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  Image,
  TouchableOpacity,
  Navigator,
  ActionSheetIOS,
  ListView,
} = React;

const ICON_SIZE = 30;
const LAN_PLACEHOLDER = 'Choose Language';
const LAN_ALL_LANGUAGE = 'All Languages';
let PLACE_DEFAULT = 'USA';

const SearchComponent = React.createClass({
  _selectTab: 0,
  _lvs: [],

  getInitialState() {
    let PLACE_DEFAULT = Countries[Math.floor(Math.random() * Countries.length)];
    return {
      toggleLanguage: false,
      currentLanguage: null,
      togglePlace: false,
      currentPlace: PLACE_DEFAULT,
    }
  },

  _resetLoadedStatus() {
    this._lvs.forEach((lv) => {
      lv.clearData();
    })
  },

  onChangeTab(tab) {
    this._selectTab = tab.i;
    const refreshListView = this._lvs[tab.i];
    refreshListView && refreshListView.reloadDataIfNeed();
  },

  onSelectPlace(place) {
    this.setState({
      togglePlace: false,
      currentPlace: place,
    });

    this._lvs[this._selectTab].reloadData();
  },

  onSelectLanguage(language) {
    this.setState({
      toggleLanguage: false,
      currentLanguage: language,
    });

    this._lvs[this._selectTab].reloadData();
  },

  _basePath() {
    let apiPath = GHService.apiPath() + '/search/users?q=';
    return apiPath;
  },

  _isNotUsingDefaultLanguage() {
    const currentLan = this.state.currentLanguage;
    return currentLan  && currentLan != 'All Languages';
  },

  reloadPlacePath() {
    let path = this._basePath();
    path += 'location:' + this.state.currentPlace;

    if (this._isNotUsingDefaultLanguage()) {
      path += '+language:' + this.state.currentLanguage;
    }

    path += '&sort=followers';
    console.log('place path', path);

    return path;
  },

  reloadWorldPath() {
    let path = this._basePath();

    if (this._isNotUsingDefaultLanguage()) {
      path += '+language:' + this.state.currentLanguage;
      path += '&sort=followers';
    } else {
      path += 'sort=followers';
    }

    return path;
  },

  handleReloadData(value) {
    const json = value._bodyInit.length > 0 && JSON.parse(value._bodyInit);
    return json.items;
  },

  renderUserRow(rowData, sectionID, rowID, highlightRow) {
    return <UserCell key={rowID} user={rowData} navigator={this.props.navigator}/>;
  },

  render() {
    let scv;
    if (this._isNotUsingDefaultLanguage()) {
      scv = (
        <ScrollableTabView
          renderTabBar={() => <DefaultTabBar/>}
          initialPage={0}
          onChangeTab={this.onChangeTab}>
          <GHRefreshListView
            enablePullToRefresh={true}
            ref={(cp) => this._lvs[0] = cp}
            tabLabel={this.state.currentPlace}
            renderRow={this.renderUserRow}
            reloadPromisePath={this.reloadPlacePath}
            handleReloadData={this.handleReloadData}
            navigator={this.props.navigator}
            >
          </GHRefreshListView>
          <GHRefreshListView
            enablePullToRefresh={true}
            ref={(cp) => this._lvs[1] = cp}
            tabLabel="World"
            renderRow={this.renderUserRow}
            reloadPromisePath={this.reloadWorldPath}
            handleReloadData={this.handleReloadData}
            navigator={this.props.navigator}
            >
          </GHRefreshListView>
        </ScrollableTabView>
      )
    } else {
      scv = (
        <GHRefreshListView
          enablePullToRefresh={true}
          ref={(cp) => this._lvs[0] = cp}
          tabLabel={this.state.currentPlace}
          renderRow={this.renderUserRow}
          reloadPromisePath={this.reloadPlacePath}
          handleReloadData={this.handleReloadData}
          navigator={this.props.navigator}
          >
        </GHRefreshListView>
      )
    }
    let top = 64;
    if (Platform.OS === 'android') {
      top = 44;
    }

    return (
      <View style={[styles.container, {paddingTop: top}]}>
        <LanguageComponent
          languageList={Countries}
          onSelectLanguage={this.onSelectPlace}
          currentLanguage={this.state.currentPlace}
        />
        <LanguageComponent
          onSelectLanguage={this.onSelectLanguage}
          languageList={Languages}
        />
        {scv}
      </View>
    )
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64,
    backgroundColor: 'white',
  },
  tabView: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
});

module.exports = SearchComponent;
