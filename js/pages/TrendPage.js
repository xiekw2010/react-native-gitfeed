import React, {
  Component,
  PropTypes,
} from 'react'
import {
  View,
  ActivityIndicatorIOS,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  Image,
  TouchableOpacity,
  ListView,
  Linking,
  Dimensions
} from 'react-native'
import Layout from '../constants/Layout'
import {
  getRequest,
  userFollowQuery,
  starredReposCount
} from '../services/GithubServices'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/Ionicons'
import RepoCell from '../common/RepoCell'
import Colors from '../constants/Colors'
import { Text, } from '../common/F8Text'
import AlertStyle from '../constants/Alerts'
import FadeIn from '@exponent/react-native-fade-in-image'
import Swiper from 'react-native-swiper'
import GHRefreshListView from '../common/GHRefreshListView'
import ScrollableTabView from 'react-native-scrollable-tab-view'
import DefaultTabBar from '../common/DefaultTabBar'
import { withNavigation } from '@exponent/ex-navigation'
import Touchable from '../common/F8Touchable'

const SHOW_CASE_PATH = 'http://trending.codehub-app.com/v2/showcases'
const TRENDING_PATH = 'http://trending.codehub-app.com/v2/trending'
const { width } = Dimensions.get('window')
const BANNER_HEIGHT = 80

@withNavigation
class TrendPage extends Component {
  static route = {
    navigationBar: {
      title: 'Popular'
    },
  }

  shuffle(a) {
    for (let i = a.length; i; i--) {
      let j = Math.floor(Math.random() * i);
      [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }

    return a
  }

  _headerHeight = 0
  state = {
    banners: []
  }

  async componentDidMount() {
    try {
      let banners = await fetch(SHOW_CASE_PATH)
      banners = await banners.json()
      this.setState({ banners, })
    } catch (err) {

    }
  }

  renderHeader() {
    const { banners } = this.state
    if (!banners.length) return null

    const bannerViews = this.shuffle(banners)
      .slice(0, 5)
      .map((b, i) => {
        return (
          <Touchable
            style={[styles.container, { height: this.props.height }]}
            onPress={() => this.props.navigator.push('Showcase', { showcase: b })}
            key={i}
          >
            <Image
              style={styles.showcase}
              source={{uri: b.image_url}}
              resizeMode={'repeat'}
            >
              <Text style={styles.showcaseName}>{b.name}</Text>
            </Image>
          </Touchable>
        )
      })

    return (
      <Swiper
        style={styles.wrapper}
        height={BANNER_HEIGHT}
        paginationStyle={{ bottom: 10, left: null, right: 10 }}
        loop>
        {bannerViews}
      </Swiper>
    )
  }

  renderRow(rowData, sectionID, rowID, highlightRow) {
    return <RepoCell repo={rowData} navigator={this.props.navigator}/>
  }

  _getPath(option) {
    let path = TRENDING_PATH + '?since=' + option
    let currentLanguage
    if (currentLanguage && currentLanguage != 'All Languages') {
      path = path + '&language=' + currentLanguage.toLowerCase()
    }

    return path
  }

  render() {
    const contentInset = { ...Layout.contentInset, top: 0 }

    // although the listviews is new, but there are already mounted
    const listViews = ['daily', 'weekly', 'monthly']
      .map(name => <GHRefreshListView
        enablePullToRefresh={true}
        key={name}
        contentInset={contentInset}
        tabLabel={name}
        path={this._getPath(name)}
        renderRow={this.renderRow.bind(this)}
        renderHeader={this.renderHeader.bind(this)}
        navigator={navigator}/>)

    return (
      <View style={styles.container}>
        <ScrollableTabView
          renderTabBar={props =>
             <DefaultTabBar {...props}
              underlineColor={Colors.blue}
              underlineHeight={2}
             />}
          style={styles.tabView}
          tabBarUnderlineColor={Colors.blue}
          tabBarActiveTextColor={Colors.blue}>
          {listViews}
        </ScrollableTabView>
      </View>
    )
  }
}

TrendPage.propTypes = {}
TrendPage.defaultProps = {}

export default TrendPage

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  tabView: {
    marginTop: Layout.contentInset.top
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  image: {
    width,
    flex: 1
  },
  showcase: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: BANNER_HEIGHT
  },
  showcaseName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
})