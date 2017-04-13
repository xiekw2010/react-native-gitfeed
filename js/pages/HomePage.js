import React, { PropTypes, Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Navigator,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import GHRefreshListView from '../common/GHRefreshListView'
import Layout from '../constants/Layout'
import { connect } from 'react-redux'
import { create } from '../common/F8StyleSheet'
import GHCell from '../common/GHEventCell'
import { SearchButton } from '../common/SearchView'
import { goToPage } from '../store/configureStore'

class HomePage extends Component {
  static route = {
    navigationBar: {
      title(params, props) {
        return <SearchButton onPress={_ => goToPage('Search')}/>
      },
    },
  }

  render() {
    const { user } = this.props

    return (
      <GHRefreshListView
        path={`/users/${user.login}/received_events`}
        renderRow={this.renderRow.bind(this)}
        contentInset={Layout.contentInset}
        contentOffset={{x:0, y:-Layout.contentInset.top}}
        {...this.props}
      />
    )
  }

  renderRow(rowData, sectionID, rowID, highlightRow) {
    return (
      <GHCell key={rowID} ghEvent={rowData} navigator={this.props.navigator}/>
    )
  }
}

HomePage.propTypes = {
  navigator: PropTypes.object,
  user: PropTypes.object
}
HomePage.defaultProps = {
  user: { login: '' }
}

const select = state => {
  return {
    user: state.login.user,
  }
}

export default connect(select)(HomePage)
