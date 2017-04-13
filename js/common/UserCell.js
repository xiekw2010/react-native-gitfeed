import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  Platform,
  ScrollView,
  SegmentedControlIOS
} from 'react-native'
import Colors from '../constants/Colors'
import CStyles from '../constants/Styles'
import { Heading2 } from './F8Text'
import Touchable from './F8Touchable'

class UserCell extends Component {
  openTargetUser() {
    const { user, navigator } = this.props
    navigator.push('UserDetail', { user })
  }

  render() {
    const user = this.props.user

    return (
      <Touchable onPress={this.openTargetUser.bind(this)}>
        <View style={styles.cellContentView}>
          <View style={styles.rowContent}>
            <Image style={styles.avatar} source={{uri: user.avatar_url}}/>
            <Heading2 style={styles.userName}>{user.login}</Heading2>
          </View>
          <View style={CStyles.separatorViewStyle}/>
        </View>
      </Touchable>
    )
  }
}

UserCell.propTypes = {
  user: React.PropTypes.object,
}
UserCell.defaultProps = {}

export default UserCell

const styles = StyleSheet.create({
  cellContentView: {
    flexDirection: 'column',
  },
  rowContent: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    marginLeft: 15,
    backgroundColor: Colors.imagePlaceholder,
  },
  userName: {
    marginLeft: 20,
  },
})