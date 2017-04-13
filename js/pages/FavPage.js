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
import { getFavPages } from '../actions/fav'
import GridPage from '../common/GridPage'

class FavPage extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.dispatch(getFavPages())
  }

  render() {
    return <GridPage
      {...this.props}
      style={this.props.style}
      navigator={this.props.navigator}
      dataSource={this.props.dataSource}/>
  }
}

FavPage.propTypes = {
  dataSource: PropTypes.array.isRequired
}
FavPage.defaultProps = {
  dataSource: []
}

const mapStateToProps = state => {
  return {
    dataSource: state.favs
  }
}

export default connect(mapStateToProps)(FavPage)