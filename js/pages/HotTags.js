'use strict'

import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import { connect } from 'react-redux'
import { getHotTags, startSearch } from '../actions/search'
import CStyles from '../constants/Styles'
import Color from '../constants/Colors'

const RoundTagButton = require('../common/RoundTagButton')

class HotTags extends Component {
  componentDidMount() {
    this.props.dispatch && this.props.dispatch(getHotTags())
  }

  render() {
    let { tags, style, dispatch } = this.props
    tags = tags && tags.map((tag, i) => {
        const color = i === 0 ? Color.blue : Color.lightBlack
        return (
          <RoundTagButton
            color={color}
            style={[styles.tag, { borderColor: color }]}
            key={i}
            text={tag}
            onSelect={_ => dispatch(startSearch(tag, 'TAG'))}
          />
        )
      })
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.hotSearch}>Suggested:</Text>
        <View style={styles.tagContainer}>
          {tags}
        </View>
        <View style={[CStyles.separatorViewStyle, { marginTop: 10 }]}/>
      </View>
    )
  }
}

HotTags.propTypes = {
  tags: PropTypes.array
}
HotTags.defaultProps = {}

const mapStateToProps = state => {
  return {
    tags: state.search.hotTags
  }
}

exports.HotTags = connect(mapStateToProps)(HotTags)
exports.__cards__ = (define) => {
  define('normal', _ => <HotTags/>)
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  hotSearch: {
    margin: 5,
    marginBottom: 10,
    color: Color.lightBlack
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 3
  },
  tag: {
    marginLeft: 10,
    marginBottom: 10,
    borderColor: Color.lightBlack
  },
})