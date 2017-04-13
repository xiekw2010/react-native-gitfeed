import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native'
import { SearchInput } from '../common/SearchView'
import { HotTags } from './HotTags'
import SearchHistory from './SearchHistory'
import { connect } from 'react-redux'
import { startSearch, } from '../actions/search'
import { changeLanguage } from '../actions/language'
import { mapRuleToQuery } from '../reducers/language'
import ScrollableTabView from 'react-native-scrollable-tab-view'
import Colors from '../constants/Colors'
import Layout from '../constants/Layout'
import CStyles from '../constants/Styles'
import LanguagePicker from './Languages'
import GHRefreshListView from '../common/GHRefreshListView'
import RepoCell from '../common/RepoCell'
import UserCell from '../common/UserCell'
import { create } from '../common/F8StyleSheet'
import DefaultTabBar from '../common/DefaultTabBar'

const SEARCH_OPTIONS = ['Users', 'Repos', 'Orgs']

class SearchPage extends Component {
  static route = {
    navigationBar: {
      title: params => <SearchInput rightPadding={35}/>,
      borderBottomWidth: 0,
      renderRight: (route, props) => <LanguagePicker />
    }
  }

  state = {
    seg: 'Users'
  }

  _mapSegToQuery(searchText, seg) {
    const { language, sort } = this.props
    let value = ''
    switch (seg) {
      case 'Users':
        value = `/users?q=${searchText}`
        break
      case 'Repos':
        value = `/repositories?q=${searchText}${mapRuleToQuery(sort)}`
        break
      case 'Orgs':
        value = `/users?q=${searchText}+type:org`
        break
    }

    let lang = ''
    if (language !== 'All Languages') {
      lang = `+language:${language}`
    }

    return '/search' + value + lang
  }

  _mapSegToRenderRow(seg) {
    const { navigator } = this.props

    let value
    switch (seg) {
      case 'Users':
        value = rowData => <UserCell user={rowData} navigator={navigator}/>
        break
      case 'Repos':
        value = rowData => <RepoCell repo={rowData} navigator={navigator}/>
        break
      case 'Orgs':
        value = rowData => <UserCell user={rowData} navigator={navigator}/>
        break
    }

    return value
  }

  componentDidMount() {
    this.props.dispatch(changeLanguage('All Languages'))
  }

  componentWillUnmount() {
    this.props.dispatch(startSearch(''))
  }

  render() {
    const { searchText, } = this.props
    const contentInset = { ...Layout.contentInset, top: 0 }

    // although the listviews is new, but there are already mounted
    const listViews = SEARCH_OPTIONS
      .map(name => <GHRefreshListView
        enablePullToRefresh={false}
        key={name}
        contentInset={contentInset}
        tabLabel={name}
        path={this._mapSegToQuery(searchText, name)}
        renderRow={this._mapSegToRenderRow(name)}
        getRowDataArray={v => v.items}
        navigator={navigator}/>)

    if (searchText.length) {
      return (
        <View style={styles.container}>
          <ScrollableTabView
            renderTabBar={props =>
             <DefaultTabBar {...props}
              underlineColor={Colors.blue}
              underlineHeight={2}
             />}
            style={styles.tabView}
            onChangeTab={tab => this.setState({ seg: SEARCH_OPTIONS[tab.i] , })}
            tabBarUnderlineColor={Colors.blue}
            tabBarActiveTextColor={Colors.blue}>
            {listViews}
          </ScrollableTabView>
        </View>
      )
    } else {
      return (
        <ScrollView style={styles.container}>
          <View
            style={[CStyles.separatorViewStyle, {
                 alignSelf: 'stretch',
                 marginTop: Layout.contentInset.top}
                 ]}/>
          <HotTags />
          <SearchHistory/>
        </ScrollView>
      )
    }
  }
}

SearchPage.propTypes = {
  searchText: PropTypes.string
}
SearchPage.defaultProps = {
  searchText: ''
}

const mapStateToProps = state => {
  return {
    searchText: state.search.searchText,
    language: state.language.currentLanguage,
    sort: state.language.currentRule
  }
}

export default connect(mapStateToProps)(SearchPage)

const styles = create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  tabView: {
    marginTop: Layout.contentInset.top,
  },
})
