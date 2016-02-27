const React = require('react-native');
const GHService = require('../networkService/GithubServices');
const CommonComponents = require('../commonComponents/CommonComponents');
const ScrollableTabView = require('react-native-scrollable-tab-view');
const Colors = require('../commonComponents/Colors');
const DefaultTabBar = require('./DefaultTabBar');
const GHRefreshListView = require('./GHRefreshListView');
const RepoCell = require('./RepoCell');
const UserCell = require('./UserCell');
const LanguageComponent = require('./LanguageComponent');
const TrendLanguages = require('../commonComponents/TrendLanguages.json');
const ShowCasesComponent = require('./ShowCasesComponent');
const ExploreCell = require('./ExploreCell');
const DXRNUtils = require('../commonComponents/DXRNUtils');
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
  ListView,
} = React;

const ICON_SIZE = 12;
const BASE_TRENDING_PATH = 'http://trending.codehub-app.com/v2/trending';

const OrgComponent = React.createClass({
  _selectTab: 0,
  _lvs: [],

  getInitialState() {
    return {
      currentLanguage: null,
    }
  },

  _resetLoadedStatus() {
    this._lvs.forEach((lv) => {
      lv.clearData();
    })
  },

  onSelectLanguage(language) {
    this.setState({
      currentLanguage: language,
    });

    const refreshListView = this._lvs[this._selectTab];
    refreshListView && refreshListView.reloadData();
  },

  onChangeTab(tab) {
    this._selectTab = tab.i;
    const refreshListView = this._lvs[tab.i];
    refreshListView && refreshListView.reloadDataIfNeed();
  },

  _getPath(desc) {
    let path = BASE_TRENDING_PATH + '?since=' + desc;
    const currentLanguage = this.state.currentLanguage;
    if (currentLanguage && currentLanguage != 'All Languages') {
      path = path + '&language=' + this.state.currentLanguage.toLowerCase();
    }

    return path;
  },

  reloadDailyPath() {
    return this._getPath('daily');
  },

  reloadWeeklyPath() {
    return this._getPath('weekly');
  },

  reloadMonthlyPath() {
    return this._getPath('monthly');
  },

  handleReloadData(value) {
    const json = value._bodyInit.length > 0 && JSON.parse(value._bodyInit);
    return json;
  },

  renderRepo(rowData, sectionID, rowID, highlightRow) {
    return <ExploreCell key={rowID} trendRepo={rowData} navigator={this.props.navigator}/>;
  },

  render() {
    let paddingTop = 64;
    if (Platform.OS == 'android') {
      paddingTop = 44;
    }
    return (
      <View style={{backgroundColor: 'white', paddingTop: paddingTop, flex: 1}}>
        <ShowCasesComponent style={styles.showcase} navigator={this.props.navigator}/>
        <LanguageComponent
          languageList={TrendLanguages}
          onSelectLanguage={this.onSelectLanguage}
        />
        <ScrollableTabView
          renderTabBar={() => <DefaultTabBar />}
          onChangeTab={this.onChangeTab}
          >
          <GHRefreshListView
            enablePullToRefresh={true}
            ref={(cp) => this._lvs[0] = cp}
            tabLabel="Daily"
            renderRow={this.renderRepo}
            reloadPromisePath={this.reloadDailyPath}
            handleReloadData={this.handleReloadData}
            navigator={this.props.navigator}
            >
          </GHRefreshListView>
          <GHRefreshListView
            enablePullToRefresh={true}
            ref={(cp) => this._lvs[1] = cp}
            tabLabel="Weekly"
            renderRow={this.renderRepo}
            reloadPromisePath={this.reloadWeeklyPath}
            handleReloadData={this.handleReloadData}
            navigator={this.props.navigator}
            >
          </GHRefreshListView>
          <GHRefreshListView
            enablePullToRefresh={true}
            ref={(cp) => this._lvs[2] = cp}
            tabLabel="Monthly"
            renderRow={this.renderRepo}
            reloadPromisePath={this.reloadMonthlyPath}
            handleReloadData={this.handleReloadData}
            navigator={this.props.navigator}
            >
          </GHRefreshListView>
        </ScrollableTabView>
      </View>
    )
  }
});

const styles = StyleSheet.create({
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginRight: 3,
  },
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  scvContainerStyle: {
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  showcase: {
    height: 120,
  },
  poplular: {
    padding: 5,
  },
});

module.exports = OrgComponent;
