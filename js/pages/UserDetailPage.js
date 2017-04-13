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
} from 'react-native'
import Layout from '../constants/Layout'
import {
  getRequest,
  userFollowQuery,
  starredReposCount
} from '../services/GithubServices'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/Ionicons'
import RepoCell from '../common/RepoCell'
import Colors from '../constants/Colors'
import { Text, } from '../common/F8Text'
import AlertStyle from '../constants/Alerts'
import FadeIn from '@exponent/react-native-fade-in-image'

const ICON_SIZE = 18

class UserDetailPage extends Component {
  static route = {
    navigationBar: {
      title(params) {
        if (params.user) return `${params.user.login}`
      },
    },
  }

  _headerHeight = 0
  state = {
    dataSource: new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    }),
  }

  onHeaderLayout(e) {
    this._headerHeight = e.nativeEvent.layout.height
  }

  async onLoadDetailUser(user) {
    try {
      const repos = await getRequest(`${user.repos_url}?sort=updated`)
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(repos),
        userLoaded: true
      })
    } catch (err) {
      // TODO: render the repos error
    }
  }

  renderHeader() {
    return (
      <UserAboutComponent
        key={this.props.user.login}
        user={this.props.user}
        onLayout={this.onHeaderLayout}
        navigator={this.props.navigator}
        onLoadUser={this.onLoadDetailUser.bind(this)}
      />
    )
  }

  renderRow(rowData, sectionID, rowID, highlightRow) {
    return <RepoCell repo={rowData} navigator={this.props.navigator}/>
  }

  render() {
    return <ListView
      style={styles.container}
      dataSource={this.state.dataSource}
      renderRow={this.renderRow.bind(this)}
      renderHeader={this.renderHeader.bind(this)}
      automaticallyAdjustContentInsets={false}
      contentInset={Layout.contentInset}
      contentOffset={{x:0, y:-Layout.contentInset.top}}
      scrollRenderAheadDistance={50}>
    </ListView>
  }
}

UserDetailPage.propTypes = {
  user: PropTypes.object
}
UserDetailPage.defaultProps = {}

export default UserDetailPage

const AboutComponent = React.createClass({
  PropTypes: {
    /*
     * Just the simplest user
     * {id: 3621906, login: "dongxicheng",
     *   gravatar_id: "",
     *   url: "https://api.github.com/users/dongxicheng",
     *   avatar_url: "https://avatars.githubusercontent.com/u/3621906?"
     * }
     */
    user: React.PropTypes.object,
    onLoadUser: React.PropTypes.func,
  },

  getInitialState() {
    return {
      user: this.props.user,
    }
  },

  handleLink(url) {
    Linking.canOpenURL(url).then(supported => {
      if (!supported) {
        console.log('Can\'t handle url: ' + url);
      } else {
        return Linking.openURL(url);
      }
    }).catch(err => console.error('An error occurred', err));
  },

  async onFollow() {
    const user = this.state.user
    const { isFollowing, login, } = user
    const action = isFollowing ? 'DELETE' : 'PUT'

    try {
      await userFollowQuery(login, action)
      user.isFollowing = !isFollowing
      this.setState({ user, })
    } catch (err) {
      this.handleError(err)
    }
  },

  handleError(err) {
    const { navigator } = this.props
    if (~err.message.indexOf('401')) {
      navigator.showLocalAlert('You need to login first', AlertStyle.warning)
      setTimeout(_ => navigator.push('Login'), 2000)
    } else {
      navigator.showLocalAlert(err.message, AlertStyle.error)
    }
  },

  onOpenFollowers() {
    const url = this.state.user.followers_url
    if (!url) return

    const user = {
      url: url,
      title: 'Followers',
    }
    this.props.navigator.push('UserList', user)
  },

  onOpenFollowing() {
    const url = this.state.user.url
    if (!url) return

    const user = {
      url: url + '/following',
      title: 'Following',
    }
    this.props.navigator.push('UserList', user)
  },

  onOpenRepos() {
    const url = this.state.user.repos_url
    if (!url) return

    this.props.navigator.push('RepoList', {
      url: url + '?sort=updated',
      title: `${this.state.user.login}'s repos`
    })
  },

  onOpenStarredRepos() {
    const username = this.state.user.login
    /**
     * This is a a little special for starred repo API
     */
    const url = 'https://api.github.com' + '/users/' + username + '/starred'
    const repo = {
      url: url,
      title: username + "'s Starred",
    }
    this.props.navigator.push('RepoList', repo)
  },

  renderOrg(org) {
    return (
      <TouchableOpacity
        key={org.avatar_url}
        onPress={() => {
          this.props.navigator.push('UserDetail', { user: org })
        }}>
        <FadeIn>
          <Image source={{uri: org.avatar_url}}
                 style={styles.orgnizationsImage}/>
        </FadeIn>
      </TouchableOpacity>
    )
  },

  async componentDidMount() {
    let { user, onLoadUser, isLogin }= this.props
    try {
      user = await getRequest(user.url)
      onLoadUser && onLoadUser(user)
      this.setState({ user, })
    } catch (err) {
    }

    try {
      user.orgs = await getRequest(user.organizations_url)
      this.setState({ user, })
    } catch (err) {
    }

    try {
      user.starredCount = await starredReposCount(user.login)
      this.setState({ user, })
    } catch (err) {

    }

    if (isLogin) {
      try {
        user.isFollowing = await userFollowQuery(user.login, 'GET')
        this.setState({ user, })
      } catch (err) {

      }
    }
  },

  followButton() {
    if (this.props.loginedUser.login == this.state.user.login) {
      return null
    }
    const isFollowing = this.state.user.isFollowing
    let followBackgroundColor = '#5ca941'
    let followContentColor = 'white'
    let followAction = 'Follow'
    if (isFollowing) {
      followBackgroundColor = '#CECECE'
      followContentColor = Colors.black
      followAction = 'Unfollow'
    }
    const followStatus = (
      <TouchableOpacity onPress={this.onFollow}>
        <View style={[styles.statusFollowButton,
                      {backgroundColor: followBackgroundColor}]}>
          <Icon
            name='ios-person-outline'
            size={ICON_SIZE}
            style={styles.icon}
            color={followContentColor}/>
          <Text style={[styles.statusFollowButtonText,
                        {color: followContentColor}]}>{followAction}</Text>
        </View>
      </TouchableOpacity>
    )

    return followStatus
  },

  render() {
    const user = this.state.user

    let userCompany
    if (user.company) {
      userCompany = (
        <View style={styles.iconTextContainer}>
          <Icon
            name='ios-people-outline'
            size={ICON_SIZE}
            style={styles.icon}
            color={Colors.textGray}/>
          <Text style={styles.profileInfoLocation}>{user.company}</Text>
        </View>
      )
    }

    let userLocation
    if (user.location) {
      userLocation = (
        <View style={styles.iconTextContainer}>
          <Icon
            name='ios-map-outline'
            size={ICON_SIZE}
            style={styles.icon}
            color={Colors.textGray}/>
          <Text style={styles.profileInfoLocation}>{user.location}</Text>
        </View>
      )
    }

    let userEmail
    if (user.email) {
      userEmail = (
        <View style={styles.iconTextContainer}>
          <Icon
            name='ios-mail-outline'
            size={ICON_SIZE}
            style={styles.icon}
            color={Colors.textGray}/>
          <Text
            style={styles.profileInfoEmailAndSite}
            onPress={this.handleLink.bind(this, user.email)}
          >{user.email}</Text>
        </View>
      )
    }

    let userBlog
    if (user.blog) {
      userBlog = (
        <View style={styles.iconTextContainer}>
          <Icon
            name='logo-rss'
            size={ICON_SIZE}
            style={styles.icon}
            color={Colors.textGray}/>
          <Text
            style={styles.profileInfoEmailAndSite}
            onPress={this.handleLink.bind(this, user.blog)}
          >{user.blog}</Text>
        </View>
      )
    }

    let userJoined
    if (user.created_at) {
      const date = new Date(user.created_at).toISOString().slice(0, 10)
      const joined = 'Joined on ' + date
      userJoined = (
        <View style={styles.iconTextContainer}>
          <Icon
            name='ios-clock-outline'
            size={ICON_SIZE}
            style={styles.icon}
            color={Colors.textGray}/>
          <Text style={styles.profileInfoLocation}>{joined}</Text>
        </View>
      )
    }

    let userBio
    if (user.bio && user.bio.length) {
      userBio = (
        <View style={{ padding: 15, paddingTop: 5, paddingBottom: 0 }}>
          <Text style={{fontSize: 12, lineHeight: 16, color: Colors.textGray}}>
            {user.bio}
          </Text>
        </View>
      )
    }

    let userOrg
    if (user.orgs && user.orgs.length) {
      userOrg = (
        <View style={{flexDirection: 'column', marginTop: 5}}>
          <Text style={styles.orgnizationsText}>Organizations</Text>
          <View style={styles.orgnizations}>
            {user.orgs.map(this.renderOrg)}
          </View>
        </View>
      )
    }

    let followStatus, starredRepos, followers, following, reposDesc = 'Popular repos'
    if (user.type === 'User') {
      followStatus = this.followButton.call(this)

      starredRepos = (
        <TouchableOpacity onPress={this.onOpenStarredRepos}
                          style={{flex: 1}}>
          <View style={styles.statusInfoTouch}>
            <Text style={styles.statusInfoTouchNum}>
              {user.starredCount || '...'}
            </Text>
            <Text style={styles.statusInfoTouchDes}>
              Starred
            </Text>
          </View>
        </TouchableOpacity>
      )

      followers = (
        <TouchableOpacity onPress={this.onOpenFollowers} style={{flex: 1}}>
          <View style={styles.statusInfoTouch}>
            <Text style={styles.statusInfoTouchNum}>
              {user.followers}
            </Text>
            <Text style={styles.statusInfoTouchDes}>
              Followers
            </Text>
          </View>
        </TouchableOpacity>
      )

      following = (
        <TouchableOpacity onPress={this.onOpenFollowing} style={{flex: 1}}>
          <View style={styles.statusInfoTouch}>
            <Text style={styles.statusInfoTouchNum}>
              {user.following}
            </Text>
            <Text style={styles.statusInfoTouchDes}>
              Following
            </Text>
          </View>
        </TouchableOpacity>
      )

      reposDesc = 'repos'
    }


    return (
      <View style={[styles.scvContainerStyle]} {...this.props}>
        <View style={styles.profile}>
          <Image style={styles.profileImage} source={{uri: user.avatar_url}}/>
          <View style={styles.profileInfo}>
            <Text style={styles.profileInfoName}>{user.name}</Text>
            <Text style={styles.profileInfoNickName}>{user.login}</Text>
            {userCompany}
            {userLocation}
            {userEmail}
            {userBlog}
            {userJoined}
          </View>
        </View>
        {userBio}
        {userOrg}
        <View style={styles.status}>
          {followStatus}
          <View style={styles.statusInfo}>
            {followers}
            {starredRepos}
            {following}
            <TouchableOpacity onPress={this.onOpenRepos} style={{flex: 1}}>
              <View style={styles.statusInfoTouch}>
                <Text style={styles.statusInfoTouchNum}>
                  {user.public_repos}
                </Text>
                <Text style={styles.statusInfoTouchDes}>
                  {reposDesc}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
})

const select = ({ login }) => {
  return {
    isLogin: !!login.user.token,
    loginedUser: login.user
  }
}
export const UserAboutComponent = connect(select)(AboutComponent)

var styles = StyleSheet.create({
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginRight: 3,
  },
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  scvContainerStyle: {
    justifyContent: 'flex-start',
    flexDirection: 'column',
    flex: 1,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  profile: {
    padding: 15,
    flexDirection: 'row',
    alignSelf: 'stretch',
    paddingBottom: 0,
  },
  profileImage: {
    width: 110,
    height: 110,
    backgroundColor: Colors.imagePlaceholder,
    borderRadius: 3,
  },
  profileInfo: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    marginLeft: 15,
    justifyContent: 'space-between',
    paddingBottom: 5,
  },
  profileInfoName: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 3,
  },
  profileInfoNickName: {
    color: 'gray',
    fontSize: 12,
    marginBottom: 10,
  },
  profileInfoLocation: {
    color: 'black',
    fontSize: 12,
  },
  profileInfoEmailAndSite: {
    color: Colors.textLink,
    fontSize: 12,
  },
  orgnizations: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    flexWrap: 'wrap',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    paddingLeft: 20,
    paddingBottom: 10,
    paddingTop: 10,
  },
  orgnizationsText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 15,
  },
  orgnizationsImage: {
    width: 30,
    height: 30,
    marginLeft: 3,
    borderRadius: 2,
    marginBottom: 2,
    backgroundColor: Colors.imagePlaceholder,
  },
  status: {
    flexDirection: 'column',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 10,
    paddingTop: 5,
  },
  statusFollowButton: {
    alignSelf: 'stretch',
    backgroundColor: '#5ca941',
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
  },
  statusFollowButtonText: {
    color: 'white',
  },
  statusInfo: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
    paddingBottom: 0,
    paddingTop: 5
  },
  statusInfoTouch: {
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  statusInfoTouchNum: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 17,
  },
  statusInfoTouchDes: {
    color: 'gray',
    fontSize: 13,
    fontWeight: 'normal'
  },

})