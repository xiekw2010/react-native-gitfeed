const React = require('react-native');
const GHService = require('../networkService/GithubServices');
const CommonComponents = require('../commonComponents/CommonComponents');
const Colors = require('../commonComponents/Colors');
const GHRefreshListView = require('./GHRefreshListView');
const ShowCaseComponent = require('./ShowCasesComponent');
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

const TREND_BASE_PATH = 'http://trending.codehub-app.com/v2/showcases/';

const OrgComponent = React.createClass({
  propTypes: {
    showcase: React.PropTypes.object,
  },

  reloadPath() {
    const path = TREND_BASE_PATH + this.props.showcase.slug;
    console.log('showcase path', path);
    return path;
  },

  handleReloadData(value) {
    const json = value._bodyInit.length > 0 && JSON.parse(value._bodyInit);
    return json.repositories;
  },

  renderRepo(rowData, sectionID, rowID, highlightRow) {
    return <ExploreCell key={rowID} trendRepo={rowData} navigator={this.props.navigator}/>;
  },

  renderHeader() {
    const showcase = this.props.showcase;
    return (
      <View style={styles.header}>
        <Image
          style={styles.showcase}
          source={{uri: showcase.image_url}}
          resizeMode={'cover'}
          >
          <Text style={styles.showcaseName}>{showcase.name}</Text>
        </Image>
        <Text style={styles.desc}>
          {showcase.description}
        </Text>
        {CommonComponents.renderSepLine()}
      </View>
    )
  },

  render() {
    let top = 64;
    if (Platform.OS === 'android') {
      top = 44;
    }
    return (
      <View style={{backgroundColor: 'white', paddingTop: top, flex: 1}}>
        <GHRefreshListView
          enablePullToRefresh={false}
          renderRow={this.renderRepo}
          reloadPromisePath={this.reloadPath}
          handleReloadData={this.handleReloadData}
          navigator={this.props.navigator}
          renderHeader={this.renderHeader}
          >
        </GHRefreshListView>
      </View>
    )
  }
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'column',
  },
  desc: {
    margin: 15,
    padding: 10,
    color: Colors.black,
    fontSize: 14,
  },
  showcase: {
    flexDirection: 'column',
    justifyContent: 'center',
    height: 65,
    alignItems: 'stretch',
  },
  showcaseName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    margin: 20,
    lineHeight: 20,
  },
});

module.exports = OrgComponent;
