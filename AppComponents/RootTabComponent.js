const React = require('react-native');
const Icon = require('react-native-vector-icons/Ionicons');
const FeedComponent = require('./FeedComponent');
const Routes = require('./Routes');
const {
  NavigatorIOS,
  TabBarIOS
} = React;

const TABBABIDS = ['feed', 'watching', 'trend', 'personal'];

const RootTabBar = React.createClass({
  getInitialState: function() {
    return {
      selectedTab: TABBABIDS[0],
    };
  },

  render: function() {
    return (
      <TabBarIOS>
        <Icon.TabBarItem
          title="Home"
          iconName="ios-home-outline"
          selectedIconName="ios-home"
          title={'Feed'}
          selected={this.state.selectedTab === TABBABIDS[0]}
          onPress={() => {
            this.setState({
              selectedTab: TABBABIDS[0],
            });
          }}>
          {Routes.navigator('feed')}
        </Icon.TabBarItem>
        <Icon.TabBarItem
          title="Explore"
          iconName="ios-flame-outline"
          selectedIconName="ios-flame"
          selected={this.state.selectedTab === TABBABIDS[1]}
          onPress={() => {
            this.setState({
              selectedTab: TABBABIDS[1],
            });
          }}>
          {Routes.navigator('explore')}
        </Icon.TabBarItem>
        <Icon.TabBarItem
          title="Famous"
          iconName="ios-people-outline"
          selectedIconName="ios-people"
          selected={this.state.selectedTab === TABBABIDS[2]}
          onPress={() => {
            this.setState({
              selectedTab: TABBABIDS[2],
            });
          }}>
          {Routes.navigator('trend')}
        </Icon.TabBarItem>
        <Icon.TabBarItem
          title="Me"
          iconName="ios-person-outline"
          selectedIconName="ios-person"
          selected={this.state.selectedTab === TABBABIDS[3]}
          onPress={() => {
            this.setState({
              selectedTab: TABBABIDS[3],
            });
          }}>
          {Routes.navigator('me')}
        </Icon.TabBarItem>
      </TabBarIOS>
    )
  },
});

module.exports = RootTabBar;
