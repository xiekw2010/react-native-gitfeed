const React = require('react-native');
const CommonComponents = require('../commonComponents/CommonComponents');
const Config = require('../config');
const Languages = require('../commonComponents/LanguageList');
const Colors = require('../commonComponents/Colors');
const ErrorPlaceholder = require('../commonComponents/ErrorPlacehoderComponent');
const DXRNUtils = require('../commonComponents/DXRNUtils');

const {
  ListView,
  View,
  ActivityIndicatorIOS,
  Text,
  TouchableHighlight,
  StyleSheet,
  TouchableOpacity,
  Image,
} = React;

const SHOW_CASE_PATH = 'http://trending.codehub-app.com/v2/showcases';

const FloorListView = React.createClass({
  getInitialState() {
    const dataSourceParam = {
      rowHasChanged: (row1, row2) => row1 !== row2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    }
    const dataSource = new ListView.DataSource(dataSourceParam);

    return {
      dataSource: dataSource,
      lastError: null,
      loading: false,
    };
  },

  reloadData() {
    if (this.state.loading) {
      return;
    }

    this.setState({
      loading: true,
      lastError: null
    });

    fetch(SHOW_CASE_PATH)
      .then(value => {
        let cases = JSON.parse(value._bodyInit);
        cases = this._shuffle(cases);
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(cases),
        });
      })
      .catch(err => {
        this.setState({
          lastError: err
        });
      })
      .done(() => {
        this.setState({
          loading: false,
        });
      })
  },

  _shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  },

  componentDidMount() {
    this.reloadData();
  },

  renderRow(rowData, sectionID, rowID, highlightRow) {
    return (
      <ShowcaseCell
       key={rowID}
       showcase={rowData}
       height={this.props.style.height || 120}
       navigator={this.props.navigator}
       />
    )
  },

  render() {
    if (this.state.loading) {
      return (
        <View style={{justifyContent: 'center', alignItems: 'center', height: 120}}>
          <ActivityIndicatorIOS size="large" />
        </View>
      );
    }

    if (this.state.lastError) {
      return (
        <ErrorPlaceholder
          title={this.state.lastError.message}
          desc={'Oops, tap to reload'}
          onPress={this.reloadData}/>
      );
    }

    return (
      <View style={this.props.style}>
        <ListView
          horizontal={true}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  },
});

const ICON_SIZE = 20;

const ShowcaseCell = React.createClass({
  propTypes: {
    showcase: React.PropTypes.object,
    height: React.PropTypes.number,
  },

  onSelectCell() {
    DXRNUtils.trackClick('clickExploreShowCase', {'name': '点击showcase' + this.props.showcase});
    this.props.navigator.push({id: 'showcase', obj: this.props.showcase});
  },

  render() {
    const showcase = this.props.showcase;

    return (
      <TouchableOpacity
        style={[styles.container, {height: this.props.height}]}
        onPress={this.onSelectCell}
        underlayColor={'lightGray'}>
        <Image
          style={styles.showcase}
          source={{uri: showcase.image_url}}
          resizeMode={'cover'}
          >
          <Text style={styles.showcaseName}>{showcase.name}</Text>
        </Image>
      </TouchableOpacity>
    );
  },
});

const styles = StyleSheet.create({
  container: {
    padding: 8,
    flexDirection: 'column',
    flex: 1,
    alignSelf: 'stretch',
    paddingRight: 0,
  },
  showcase: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    height: 110,
    width: 200,
  },
  showcaseName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0)',
    textAlign: 'center'
  },
});

module.exports = FloorListView;
