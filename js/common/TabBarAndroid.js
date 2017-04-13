import React, {
  Component,
  PropTypes,
} from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native'
import Colors from './Colors'

var FacebookTabBar = React.createClass({
  selectedTabIcons: [],
  unselectedTabIcons: [],

  propTypes: {
    goToPage: React.PropTypes.func,
    activeTab: React.PropTypes.number,
    tabs: React.PropTypes.array
  },

  /*
   {
   pageId: 'HomePage',
   name: '流行',
   iconSelected: 'ios-flame',
   iconUnSelected: 'ios-flame-outline',
   },
   */
  renderTabOption(tabItem, page) {
    const isTabActive = this.props.activeTab === page
    const color = isTabActive ? Colors.green : Colors.black
    const { name, iconSelected, iconUnSelected } = tabItem
    const icon = isTabActive ? iconSelected : iconUnSelected

    return (
      <TouchableOpacity
        key={name}
        onPress={() => this.props.goToPage(page)}
        style={styles.tab}>
        <View
          ref={(icon) => { this.selectedTabIcons[page] = icon }}
          style={styles.tabItem}
        >
          <Icon name={icon} color={color} size={20}/>
          <Text style={[styles.icon, { color: color, fontSize: 14 }]}>
            {name}
          </Text>
        </View>
      </TouchableOpacity>
    )
  },

  setAnimationValue({ value }) {
    var currentPage = this.props.activeTab

    this.unselectedTabIcons.forEach((icon, i) => {
      var iconRef = icon

      if (!icon.setNativeProps && icon !== null) {
        iconRef = icon.refs.icon_image
      }

      if (value - i >= 0 && value - i <= 1) {
        iconRef.setNativeProps({ opacity: value - i })
      }
      if (i - value >= 0 && i - value <= 1) {
        iconRef.setNativeProps({ opacity: i - value })
      }
    })
  },

  render() {
    return (
      <View>
        <View style={styles.tabs}>
          {this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
        </View>
      </View>
    )
  },
})

const styles = StyleSheet.create({
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
    borderTopColor: Colors.gray,
  },
})

export default FacebookTabBar