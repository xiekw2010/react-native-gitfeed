import React, {
  Component,
  PropTypes,
} from 'react'
import {
  Platform,
  BackAndroid,
  Navigator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  View,
  Text,
  TextInput,
  Image
} from 'react-native'
import { connect } from 'react-redux'
import Colors from './common/Colors'
import Icon from 'react-native-vector-icons/Ionicons'
import NavigationBarStyle from './common/WLNavigationBarStyle'
import HomePage from './pages/HomePage'
import RepoDetailPage from './pages/RepoDetailPage'
import { SearchBar } from './pages/HotTags'

const SCREEN_WIDTH = Dimensions.get('window').width

/**
 * The route object is
 * {
 *    id: 'pageId', // required
 *    context: {}, // the obj pass to this component
 *    title: 'some Title' || function(navigator, index, navState), The title display in this component
 *    left: function(navigator, index, navState), Default is the back button, if null, then display nothing
 *    right: function(navigator, index, navState), Default is null
 * }
 */
class WLNavigator extends Component {
  constructor(props, context) {
    super(props, context)
    this._handlers = []
  }

  getChildContext() {
    return {
      addBackButtonListener: this.addBackButtonListener,
      removeBackButtonListener: this.removeBackButtonListener,
    }
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', this.handleBackButton.bind(this))
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress', this.handleBackButton.bind(this))
  }

  addBackButtonListener(listener) {
    this._handlers.push(listener)
  }

  removeBackButtonListener(listener) {
    this._handlers = this._handlers.filter((handler) => handler !== listener)
  }

  handleBackButton() {
    for (let i = this._handlers.length - 1; i >= 0; i--) {
      if (this._handlers[i]()) {
        return true
      }
    }

    const { navigator } = this.refs
    if (navigator && navigator.getCurrentRoutes().length > 1) {
      navigator.pop()
      return true
    }

    return false
  }

  _leftButtonMapper(route, navigator, index, navState) {
    if (route.left === null) return null

    if (route.left === undefined && index > 0) {
      return (
        <TouchableOpacity
          style={styles.navButtonContainer}
          onPress={() => {navigator.pop()}}>
          <Icon name='ios-arrow-back' size={30} color={Colors.black}/>
        </TouchableOpacity>
      )
    }

    if (route.left) {
      return route.left(navigator, index, navState)
    }

    return null
  }

  _rightButtonMapper(route, navigator, index, navState) {
    if (route.right) {
      return route.right(navigator, index, navState)
    }
  }

  _titleMapper(route, navigator, index, navState) {
    if (route.title) {
      if (typeof route.title === 'string') {
        return (
          <View style={styles.titleContainer}>
            <Text
              style={styles.title}
              numberOfLines={1}
            >
              {route.title}
            </Text>
          </View>
        )
      } else {
        return route.title(navigator, index, navState)
      }
    }

    return null
  }

  render() {
    return (
      <Navigator
        ref="navigator"
        style={styles.container}
        configureScene={(route) => {
          if (route.sceneConfig) {
            return route.sceneConfig;
          }
          return Navigator.SceneConfigs.FloatFromRight;
        }}
        navigationBar={
          <Navigator.NavigationBar
            style={styles.navBar}
            routeMapper={{
              LeftButton: this._leftButtonMapper.bind(this),
              RightButton: this._rightButtonMapper.bind(this),
              Title: this._titleMapper.bind(this)
            }}
            navigationStyles={NavigationBarStyle}
          />
        }
        initialRoute={this.props.route}
        renderScene={this.renderScene}
        tabLabel={this.props.tabLabel}
      />
    )
  }

  renderScene(route, navigator) {
    switch (route.id) {
      case 'HomePage':
        return <HomePage navigator={navigator} {...route.context}/>
      case 'RepoDetailPage':
        return <RepoDetailPage navigator={navigator} {...route.context}/>
    }

    return <HomePage navigator={navigator}/>
  }
}

WLNavigator.propTypes = {
  searchTag: PropTypes.string,
  route: PropTypes.object,
  tabLabel: PropTypes.object,
}
WLNavigator.defaultProps = {
  route: {
    id: 'HomePage'
  }
}
WLNavigator.childContextTypes = {
  addBackButtonListener: React.PropTypes.func,
  removeBackButtonListener: React.PropTypes.func,
}

const StoreNavigator = connect()(WLNavigator)

StoreNavigator.goToPage = (route, tabLabel) => {
  return <StoreNavigator key={route.id} route={route} tabLabel={tabLabel}/>
}

export default StoreNavigator

const styles = StyleSheet.create({
  navButtonContainer: {
    flex: 1,
    width: 40,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  messageText: {
    fontSize: 17,
    fontWeight: '500',
    padding: 15,
    marginTop: 50,
    marginLeft: 15
  },
  button: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CDCDCD'
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '500'
  },
  navBar: {
    backgroundColor: 'white',
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 0.5
  },
  navBarText: {
    fontSize: 16,
    marginVertical: 10
  },
  navBarTitleText: {
    fontWeight: '500',
    marginVertical: 11
  },
  navBarLeftButton: {
    paddingLeft: 10,
    width: 40,
    height: 40
  },
  navBarRightButton: {
    paddingRight: 10
  },
  navBarButtonText: {
  },
  scene: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#EAEAEA'
  },
  searchBarButton: {
    padding: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: SCREEN_WIDTH - 10,
    height: 35,
    borderRadius: 4,
    margin: 5,
    backgroundColor: Colors.gray
  },
  searchBar: {
    padding: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: SCREEN_WIDTH - 10,
    height: 35,
    borderRadius: 4,
    margin: 5,
    backgroundColor: Colors.backGray
  },
  searchIcon: {
    marginLeft: 3,
    marginRight: 3,
    width: 20,
    height: 20
  },
  textInput: {
    fontSize: 14,
    alignSelf: 'stretch',
    flex: 1,
    color: Colors.black
  },
  rightContainer: {
    flexDirection: 'row'
  },
  titleContainer: {
    flex: 1,
    marginLeft: 40,
    marginRight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.black,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold'
  },
})
