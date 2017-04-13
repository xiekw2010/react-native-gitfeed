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
import Icon from 'react-native-vector-icons/Ionicons'
import Colors from '../constants/Colors'
import CStyles from '../constants/Styles'
import ReadMore from './ReadMore'
import Touchable from '../common/F8Touchable'

const ICON_SIZE = 12

class ReopCell extends Component {
  onPressCell() {
    const { repo, navigator } = this.props
    navigator.push('RepoDetail', { repo })
  }

  openAuthor() {
    const { repo, navigator } = this.props
    navigator.push('UserDetail', { user: repo.owner })
  }

  render() {
    const { repo, } = this.props
    return (
      <Touchable onPress={this.onPressCell.bind(this)}>
        <View style={styles.cellContentView}>
          <View style={styles.cellUp}>
            <TouchableOpacity onPress={this.openAuthor.bind(this)}>
              <Image
                source={{uri: repo.owner.avatar_url}}
                style={styles.avatar}
              />
            </TouchableOpacity>
            <View style={{flexDirection: 'column', marginTop: 3 }}>
              <Text style={styles.username} onPress={this.onPressCell.bind(this)}>
                {repo.full_name}
              </Text>
              <Text style={styles.createAt}>{repo.language}</Text>
            </View>
            <View style={styles.leftAction}>
              <Icon name={'ios-star'}
                    size={ICON_SIZE}
                    color={Colors.lightBlack}
              />
              <Text style={styles.actionText}>
                {repo.stargazers_count}
              </Text>
            </View>
          </View>
          <View style={styles.textActionContainer}>
            <ReadMore
              content={repo.description}
              lines={3}
            />
          </View>
          <View style={CStyles.separatorViewStyle}/>
        </View>
      </Touchable>
    )
  }
}

ReopCell.propTypes = {
  repo: PropTypes.object
}
ReopCell.defaultProps = {}

export default ReopCell

const styles = StyleSheet.create({
  /**
   * ExploreCell
   */
  cellContentView: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'stretch',
  },
  cellUp: {
    padding: 10,
    height: 40,
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: Colors.imagePlaceholder
  },
  username: {
    marginLeft: 10,
    color: '#4078C0',
    fontSize: 15,
    maxWidth: 290
  },
  textActionContainer: {
    margin: 10,
    marginTop: 7,
    marginBottom: 10,
    marginLeft: 10,
  },
  createAt: {
    marginLeft: 10,
    marginTop: 2,
    fontSize: 11,
    color: '#BFBFBF',
  },
  leftAction: {
    position: 'absolute',
    top: 0,
    right: 4,
    padding: 3,
    flexDirection: 'row',
    alignItems: 'center'
  },
  rightAction: {
    padding: 3,
    backgroundColor: "white",
  },
  actionText: {
    color: Colors.textGray,
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
})