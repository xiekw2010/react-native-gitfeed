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
import { UserListView } from '../common/DetailListView'

@withNavigation
class FamousPage extends Component {
  static route = {
    navigationBar: {
      title: 'Popular guys'
    },
  }

  render() {
    const path = '/search/users?q=location:USA&sort=followers'
    return (
      <View style={styles.container}>
        <UserListView
          url={path}
          getRowDataArray={v => v.items}
          navigator={this.props.navigator}
        />
      </View>
    )
  }
}

FamousPage.propTypes = {
  showcase: React.PropTypes.object,
}
FamousPage.defaultProps = {}

export default FamousPage

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
})