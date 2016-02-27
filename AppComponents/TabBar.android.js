
var Colors = require('../commonComponents/Colors');
var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');

var {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} = React;

var styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  tabs: {
    height: 49,
    flexDirection: 'row',
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: Colors.backGray,
  },
  icon: {

  },
});

var FacebookTabBar = React.createClass({
  selectedTabIcons: [],
  unselectedTabIcons: [],

  propTypes: {
    goToPage: React.PropTypes.func,
    activeTab: React.PropTypes.number,
    tabs: React.PropTypes.array
  },

  renderTabOption(name, page) {
    var isTabActive = this.props.activeTab === page;
    const color = isTabActive ? Colors.blue : Colors.textGray
    const tabName = name.tabName;
    const iconName = name.iconName;

    return (
      <TouchableOpacity
        key={tabName}
        onPress={() => this.props.goToPage(page)}
        style={styles.tab}>
        <View
          ref={(icon) => { this.selectedTabIcons[page] = icon }}
          style={styles.tabItem}
          >
          <Icon name={iconName} color={color} size={20}/>
          <Text style={[styles.icon, {color: color}]}>
            {tabName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },

  componentDidMount() {
    // this.setAnimationValue({value: this.props.activeTab});
    // this._listener = this.props.scrollValue.addListener(this.setAnimationValue);
  },

  setAnimationValue({value}) {
    var currentPage = this.props.activeTab;

    this.unselectedTabIcons.forEach((icon, i) => {
      var iconRef = icon;

      if (!icon.setNativeProps && icon !== null) {
        iconRef = icon.refs.icon_image
      }

      if (value - i >= 0 && value - i <= 1) {
        iconRef.setNativeProps({opacity: value - i});
      }
      if (i - value >= 0 &&  i - value <= 1) {
        iconRef.setNativeProps({opacity: i - value});
      }
    });
  },

  render() {
    return (
      <View>
        <View style={styles.tabs}>
          {this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
        </View>
      </View>
    );
  },
});

module.exports = FacebookTabBar;
