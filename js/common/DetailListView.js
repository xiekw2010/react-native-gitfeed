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
} from 'react-native'
import RepoCell from './RepoCell'
import UserCell from './UserCell'
import GHRefreshListView from './GHRefreshListView'
import { ErrorPlaceholder } from '../common/Placeholder'
import { connect } from 'react-redux'
import { startSearch, } from '../actions/search'
import { SearchFilter } from '../common/SearchView'
import PickerFilter from '../common/PickerFilter'
import Layout from '../constants/Layout'
import debounce from 'lodash/debounce'
import { defaultState, mapRuleToQuery } from '../reducers/language'

const FILTER_HEIGHT = 35
const CONTENT_INSET = {
  ...Layout.contentInset,
  top: Layout.contentInset.top + FILTER_HEIGHT
}

class DetailListView extends Component {
  static route = {
    navigationBar: {
      title(params) {
        if (params.title) return `${params.title}`
      },
    },
  }

  state = {
    filter: null
  }

  renderEmptyPlaceholder() {
    const { filter } = this.state
    const { dispatch, navigator } = this.props

    return <ErrorPlaceholder
      title={`${filter} is not here`}
      desc={`You can find ${filter} in search page`}
      buttonText={`Search!`}
      onPress={_ => {
        navigator.push('Search')
        dispatch(startSearch(filter))
      }}
    />
  }

  onChangeText(filter) {
    this.setState({ filter, })
  }

  render() {
    const { filter } = this.state
    const { url, filterFunc, filterPlaceholder } = this.props

    let listFilterFunc
    if (filter && filter.length) {
      listFilterFunc = dsObject => filterFunc && filterFunc(filter, dsObject)
    }

    const operator = ~url.indexOf('?') ? '&' : '?'
    return (
      <View style={{flex: 1}}>
        <GHRefreshListView
          enablePullToRefresh={true}
          path={`${url}${operator}per_page=100`}
          renderRow={this.props.renderRow}
          filter={listFilterFunc}
          renderEmptyPlaceholder={this.renderEmptyPlaceholder.bind(this)}
          contentInset={CONTENT_INSET}
          contentOffset={{ x: 0, y: - CONTENT_INSET.top }}
          {...this.props}
        />
        <SearchFilter
          placeholder={filterPlaceholder}
          style={styles.searchFilter}
          onChangeText={debounce(this.onChangeText.bind(this), 500)}
        />
        {this.props.children}
      </View>
    )
  }
}

DetailListView.propTypes = {
  url: PropTypes.string,
  title: PropTypes.string,
  renderRow: PropTypes.func,
  filterFunc: PropTypes.func,
  filterPlaceholder: PropTypes.string,
}
DetailListView.defaultProps = {
  filterPlaceholder: 'tap to find some repo'
}

DetailListView = connect()(DetailListView)

export class RepoListView extends Component {
  state = {
    currentRule: defaultState.currentRule,
    currentLanguage: defaultState.currentLanguage
  }

  onChange(main, sub) {
    if (main === 'choose sort') {
      this.setState({ currentRule: sub, })
    }

    if (main === 'choose languages') {
      this.setState({ currentLanguage: sub, })
    }
  }

  render() {
    const props = this.props
    const { currentRule, currentLanguage } = this.state

    let url = props.url

    if (currentRule !== defaultState.currentRule) {
      const hasQuery = ~url.indexOf('?')
      let ruleString = mapRuleToQuery(currentRule)
      if (!hasQuery) ruleString = '?' + ruleString.slice(1)
      url += ruleString
    }

    if (currentLanguage !== defaultState.currentLanguage) {
      url += `+language:${currentLanguage}`
    }

    return (
      <DetailListView
        renderRow={(rowData, sectionID, rowID, highlightRow) =>
        <RepoCell key={rowID} repo={rowData} navigator={props.navigator}/>}
        url={url}
        filterFunc={(filter, dsObject) => {
          const reg = new RegExp(`.*${filter}.*`, 'ig')
          return reg.test(dsObject.full_name)
        }}
      >
      </DetailListView>
    )
  }
}

export const UserListView = props => {
  return (
    <DetailListView
      renderRow={(rowData, sectionID, rowID, highlightRow) =>
        <UserCell key={rowID} user={rowData} navigator={props.navigator}/>}
      filterFunc={(filter, dsObject) => {
        const reg = new RegExp(`.*${filter}.*`, 'ig')
        return reg.test(dsObject.login)
      }}
      filterPlaceholder={'tap to find some one'}
      {...props}
    />
  )
}

UserListView.route = RepoListView.route = {
  navigationBar: {
    title(params) {
      if (params.title) return `${params.title}`
    },
  },
}

const styles = StyleSheet.create({
  searchFilter: {
    width: Layout.window.width,
    top: Layout.contentInset.top,
    position: 'absolute',
    left: 0,
    height: FILTER_HEIGHT,
  },
  pickerFilter: {
    position: 'absolute',
    right: 0,
    top: Layout.contentInset.top - 3,
  }
})