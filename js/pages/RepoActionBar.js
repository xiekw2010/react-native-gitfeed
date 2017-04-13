import React, {
  Component,
  PropTypes,
} from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  Image,
  TouchableOpacity,
  ListView,
  Navigator
} from 'react-native'
import Layout from '../constants/Layout'
import Colors from '../constants/Colors'
import AlertStyle from '../constants/Alerts'
import CStyles from '../constants/Styles'
import BlurView from '../common/BlurView'
import Icon from 'react-native-vector-icons/Ionicons'
import {
  getRequest,
  repoWatchQuery,
  repoStarQuery
} from '../services/GithubServices'
import { connect } from 'react-redux'

class RepoActionBar extends Component {
  state = {
    isWatch: false,
    isStar: false,
    watchCount: '...',
    starCount: '...',
    owner: null
  }

  componentDidMount() {
    this._loadData()
  }

  async _loadData() {
    const { repo, isLogin } = this.props

    let repoDetail
    try {
      repoDetail = await getRequest(repo.url)
    } catch (err) {
      console.log('load repo detial err is', err)
    }

    this.setState({
      owner: repoDetail.owner,
      watchCount: repoDetail.subscribers_count,
      starCount: repoDetail.stargazers_count,
    })

    if (isLogin) {
      try {
        const isWatch = await repoWatchQuery(repo.name, 'GET')
        const isStar = await repoStarQuery(repo.name, 'GET')
        this.setState({ isWatch, isStar })
      } catch (err) {
        this.handleError(err)
      }
    }
  }

  async handleError(err) {
    const { navigator } = this.props
    if (~err.message.indexOf('401')) {
      navigator.showLocalAlert('You need to login first', AlertStyle.warning)
      setTimeout(_ => navigator.push('Login'), 2000)
    } else {
      navigator.showLocalAlert(err.message, AlertStyle.error)
    }
  }

  async onPressWatch(action) {
    try {
      let { watchCount, isWatch } = this.state
      await repoWatchQuery(this.props.repo.name, action)
      isWatch ? --watchCount : ++watchCount
      this.setState({
        isWatch: !isWatch,
        watchCount
      })
    } catch (err) {
      this.handleError(err)
    }
  }

  async onPressStar(action) {
    try {
      let { starCount, isStar } = this.state
      await repoStarQuery(this.props.repo.name, action,)
      isStar ? --starCount : ++starCount
      this.setState({
        isStar: !isStar,
        starCount
      })
    } catch (err) {
      this.handleError(err)
    }
  }

  onPressWatchers() {

  }

  onPressStarers() {

  }

  render() {
    const {
      owner,
      isWatch,
      isStar,
      watchCount,
      starCount,
    } = this.state

    const { style, repo, navigator } = this.props

    let userCp
    if (owner) {
      userCp = (
        <TouchableOpacity
          onPress={() => navigator.push('UserDetail', { user: owner })}>
          <View style={styles.repoUser}>
            <Image
              style={styles.repoAvatar}
              source={{uri: owner.avatar_url}}/>
            <Text
              style={[styles.actionText, {
                marginRight: 10,
                color: '#fff',
                fontWeight: 'bold',
                }]}>
              {owner.login}
            </Text>
          </View>
        </TouchableOpacity>
      )
    }

    const iconEye = isWatch ? 'ios-eye' : 'ios-eye-outline'
    const actionEye = isWatch ? 'unwatch' : 'watch'

    const iconStar = isStar ? 'ios-star' : 'ios-star-outline'
    const actionStar = isStar ? 'unstar' : 'star'

    const watchAction = isWatch ? 'DELETE' : 'PUT'
    const starAction = isStar ? 'DELETE' : 'PUT'

    return (
      <BlurView
        style={[styles.repoToolBar, CStyles.separatorBorderStyle, style]}
        intensity={100}
        tint={'dark'}
      >
        {userCp}
        <ActionButton
          iconName={iconStar}
          actionName={actionStar}
          actionNumber={starCount}
          onPressAction={this.onPressStar.bind(this, starAction)}
          onPressNumbers={this.onPressStarers.bind(this)}
        />
        <ActionButton
          iconName={iconEye}
          actionName={actionEye}
          actionNumber={watchCount}
          onPressAction={this.onPressWatch.bind(this, watchAction)}
          onPressNumbers={this.onPressWatchers.bind(this)}
        />
      </BlurView>
    )
  }
}

RepoActionBar.propTypes = {
  repo: PropTypes.object
}
RepoActionBar.defaultProps = {}

const select = ({ login }) => {
  return {
    isLogin: !!login.user.token
  }
}

export default connect(select)(RepoActionBar)
export const REPO_ACTION_BAR_HEIGHT = 40
export const ActionButton = ({
  iconName,
  actionName,
  actionNumber,
  onPressAction,
  onPressNumber
}) => {
  return (
    <View style={styles.action}>
      <TouchableOpacity
        onPress={onPressAction}
      >
        <View style={styles.leftAction}>
          <Icon
            name={iconName}
            size={15}
            color={Colors.textBlack}
          />
          <Text style={[styles.actionText, { fontWeight: 'bold',}]}>
            {actionName}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onPressNumber}
        style={styles.rightAction}>
        <Text style={[styles.actionText, {marginTop: 2}]}>
          {actionNumber}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

ActionButton.propTypes = {}
ActionButton.defaultProps = {}

const styles = StyleSheet.create({
  repoToolBar: {
    width: Layout.window.width,
    height: REPO_ACTION_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    borderStyle: 'solid',
    borderColor: '#F2F2F2',
    borderRadius: 2,
    flexDirection: 'row',
    marginRight: 10,
    shadowColor: '#ccc',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    backgroundColor: "#F2F2F2",
    overflow: 'hidden'
  },
  repoUser: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  repoAvatar: {
    width: 30,
    height: 30,
    backgroundColor: Colors.imagePlaceholder,
    borderRadius: 2,
  },
  leftAction: {
    padding: 3,
    backgroundColor: "#F2F2F2",
    flexDirection: 'row'
  },
  rightAction: {
    padding: 3,
    backgroundColor: "white",
  },
  actionText: {
    color: Colors.textBlack,
    fontSize: 12,
    lineHeight: 13,
    alignSelf: 'center',
    fontWeight: '500',
    marginLeft: 2
  },
  webViewToolBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    height: 40,
    position: 'absolute',
    left: 0,
    bottom: 49,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  webLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
})

