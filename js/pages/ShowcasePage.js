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
import RepoCell from '../common/RepoCell'
import GHRefreshListView from '../common/GHRefreshListView'
import { withNavigation } from '@exponent/ex-navigation'

const SHOW_CASE_PATH = 'http://trending.codehub-app.com/v2/showcases'

@withNavigation
class ShowcasePage extends Component {
  static route = {
    navigationBar: {
      title(props) {
        return props.showcase.name
      }
    },
  }

  renderRow(rowData, sectionID, rowID, highlightRow) {
    return <RepoCell repo={rowData} navigator={this.props.navigator}/>
  }

  render() {
    const path = SHOW_CASE_PATH + '/' + this.props.showcase.slug
    return (
      <View style={styles.container}>
        <GHRefreshListView
          enablePullToRefresh={true}
          contentInset={Layout.contentInset}
          path={path}
          renderRow={this.renderRow.bind(this)}
          getRowDataArray={v => v.repositories}
          contentOffset={{x:0, y:-Layout.contentInset.top}}
        />
      </View>
    )
  }
}

ShowcasePage.propTypes = {
  showcase: React.PropTypes.object,
}
ShowcasePage.defaultProps = {}

export default ShowcasePage

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
})