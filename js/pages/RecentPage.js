'use strict'

import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { getRecent } from '../actions/recent'
import GridPage from '../common/GridPage'

class RecentPage extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.dispatch(getRecent())
  }

  render() {
    return <GridPage
      {...this.props}
      style={this.props.style}
      navigator={this.props.navigator}
      dataSource={this.props.dataSource}
    />
  }
}

RecentPage.propTypes = {
  dataSource: PropTypes.array.isRequired
}
RecentPage.defaultProps = {
  dataSource: []
}

const mapStateToProps = state => {
  return {
    dataSource: state.recents
  }
}

export default connect(mapStateToProps)(RecentPage)
