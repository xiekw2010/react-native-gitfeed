import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native'
import {
  StackNavigation,
  TabNavigation,
  TabNavigationItem,
} from '@exponent/ex-navigation'
import Icon from 'react-native-vector-icons/Ionicons'
import Colors from '../constants/Colors'
import Layout from '../constants/Layout'
import Router from './Router'

const defaultRouteConfig = {
  navigationBar: {
    translucent: true,
    translucentTint: 'light',
    tintColor: Colors.tintColor
  },
}

export default class TabNavigationLayout extends React.Component {
  render() {
    return (
      <TabNavigation
        translucent={true}
        tabBarHeight={Layout.contentInset.bottom}
        initialTab="explore">

        <TabNavigationItem
          id="explore"
          renderIcon={isSelected => this._renderIcon('Feeds', 'ios-list-box', isSelected)}>
          <StackNavigation
            defaultRouteConfig={defaultRouteConfig}
            initialRoute={Router.getRoute('Home',)}
          />
        </TabNavigationItem>

        <TabNavigationItem
          id="myApps"
          renderIcon={isSelected => this._renderIcon('Trends', 'ios-flame', isSelected)}>
          <StackNavigation
            defaultRouteConfig={defaultRouteConfig}
            initialRoute={Router.getRoute('Trend', { url: 'https://api.github.com/users/getify/followers' })}/>
        </TabNavigationItem>

        <TabNavigationItem
          id="history"
          renderIcon={isSelected => this._renderIcon('Famous', 'ios-people', isSelected)}>
          <StackNavigation
            defaultRouteConfig={defaultRouteConfig}
            initialRoute={Router.getRoute('Famous')}
          />
        </TabNavigationItem>

        <TabNavigationItem
          id="about"
          renderIcon={isSelected => this._renderIcon('Me', 'ios-person', isSelected)}>
          <StackNavigation
            defaultRouteConfig={defaultRouteConfig}
            initialRoute={Router.getRoute('Me')}
          />
        </TabNavigationItem>
      </TabNavigation>
    )
  }

  _renderIcon(title:string, iconName:string, isSelected:bool):ReactElement<any> {
    const color = isSelected ? Colors.tabIconSelected : Colors.tabIconDefault
    const iName = isSelected ? iconName : `${iconName}-outline`
    return (
      <View style={styles.tabItemContainer}>
        <Icon name={iName} size={25} color={color}/>

        <Text style={[styles.tabTitleText, {color}]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTitleText: {
    fontSize: 11,
  },
  image: {
    flex: 1,
    height: null,
    width: null,
    resizeMode: 'cover',
  },

})