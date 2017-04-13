import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native'
import Color from '../constants/Colors'
import { connect } from 'react-redux'
import {
  searchSearchHistory,
  removeSearchHistory,
  startSearch
} from '../actions/search'
import IconCell from '../common/IconCell'

class SearchHistory extends Component {
  componentDidMount() {
    this.props.getSearchHistory()
  }

  render() {
    let { history, onRemoveSearchHistory, startSearch } = this.props

    let clearAll
    if (history && history.length) {
      history = history.map((his, i) => {
          return (
            <IconCell
              key={i}
              text={his}
              rightIcon={'ios-close-outline'}
              onPressRightIcon={onRemoveSearchHistory.bind(this, his)}
              onPress={_ => startSearch(his)}
            />
          )
        })

      clearAll = (
        <TouchableOpacity
          onPress={onRemoveSearchHistory.bind(this, null)}
          style={styles.removeAllHis}>
          <Text style={styles.clearAll}>clear all history</Text>
        </TouchableOpacity>
      )
    }

    return (
      <View style={styles.container}>
        {history}
        {clearAll}
      </View>
    )
  }
}

SearchHistory.propTypes = {
  history: PropTypes.array,
  onRemoveSearchHistory: PropTypes.func,
  getSearchHistory: PropTypes.func,
  startSearch: PropTypes.func
}
SearchHistory.defaultProps = {
  history: ['金馆长', '教皇', '丘比龙']
}

const mapStateToProps = state => {
  return {
    history: state.search.history
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onRemoveSearchHistory: his => dispatch(removeSearchHistory(his)),
    getSearchHistory: _ => dispatch(searchSearchHistory()),
    startSearch: text => dispatch(startSearch(text, 'HISTORY'))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchHistory)
module.exports.__cards__ = (define) => {
  define('normal', _ => <SearchHistory/>)
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  removeAllHis: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  clearAll: {
    color: Color.green
  }
})