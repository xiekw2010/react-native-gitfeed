const React = require('react-native');
const GHService = require('../networkService/GithubServices');
const CommonComponents = require('../commonComponents/CommonComponents');
const ScrollableTabView = require('react-native-scrollable-tab-view');
const Icon = require('react-native-vector-icons/Ionicons');
const Colors = require('../commonComponents/Colors');
const RepoCell = require('./RepoCell');
const DXRNUtils = require('../commonComponents/DXRNUtils');
const Platform = require('Platform');

const {
  View,
  ActivityIndicatorIOS,
  Text,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  Image,
  TouchableOpacity,
  ListView,
  Navigator
} = React;

 const ICON_SIZE = 18;

const UserComponent = React.createClass({
  _headerHeight: 0,

  PropTypes: {
    user: React.PropTypes.object,
    userLoaded: false,
  },

  getInitialState() {
    const dataSourceParam = {
      rowHasChanged: (row1, row2) => row1 !== row2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    }

    return {
      dataSource: new ListView.DataSource(dataSourceParam),
    };
  },

  onHeaderLayout(e) {
    this._headerHeight = e.nativeEvent.layout.height;
  },

  onLoadDetailUser(user) {
    const repoURL = user.repos_url + '?sort=updated';

    GHService.fetchPromise(repoURL)
      .then(res => {
        const repos = JSON.parse(res._bodyInit);
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(repos),
          userLoaded: true,
        });
      })
  },

  renderHeader() {
    return (
      <AboutComponent
        key={this.props.user.login}
        user={this.props.user}
        onLayout={this.onHeaderLayout}
        navigator={this.props.navigator}
        onLoadUser={this.onLoadDetailUser}
      />
    )
  },

  renderRow(rowData, sectionID, rowID, highlightRow) {
    return <RepoCell repo={rowData} navigator={this.props.navigator}/>
  },

  render() {
    let idc;
    if (!this.state.userLoaded) {
      idc = (
        <ActivityIndicatorIOS
          size={'large'}
          style={{position: 'absolute', bottom:150, left: 0, right: 0}}/>
      );
    }

    let top = 0;
    if (Platform.OS === 'android') {
      top = 44;
    }

    return (
      <View style={{backgroundColor: 'white', flex: 1}}>
        <ListView
          ref={(scv) => this.scv = scv}
          style={[styles.container, {paddingTop: top}]}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
          automaticallyAdjustContentInsets={false}
          contentInset={{top: 64, left: 0, bottom: 49, right: 0}}
          contentOffset={{x:0, y:-64}}
          scrollRenderAheadDistance={50}>
        </ListView>
        {idc}
      </View>
    )
  }
});

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

  onPressEmail() {
    console.log('press email');
  },

  onPressBlog() {
    const blog = {
      html: this.state.user.blog,
      title: this.state.user.name + "'s blog"
    }
    this.props.navigator.push({id: 'web', obj: blog});
  },

  onFollow() {
    const action = this.state.user.isFollowing ? 'DELETE' : 'PUT';
    const followPromise = (() => {
      GHService.userFollowQuery(this.state.user.login, action)
        .then(value => {
          const status = value.status;
          if (status < 400) {
            this.state.user.isFollowing = !this.state.user.isFollowing ;
            this.setState({
              user: this.state.user,
            });
          }
        })
    });

    GHService.checkNeedLoginWithPromise(followPromise, this.props.navigator);
    DXRNUtils.trackClick('clickUserFollow', {name: '点击关不关注'});
  },

  onOpenFollowers() {
    const url = this.state.user.followers_url;
    if (!url) return;

    const user = {
      url: url,
      title: 'Followers',
    }
    this.props.navigator.push({id: 'userList', obj: user});
  },

  onOpenFollowing() {
    const url = this.state.user.url;
    if (!url) return;

    const user = {
      url: url + '/following',
      title: 'Following',
    }
    this.props.navigator.push({id: 'userList', obj: user});
  },

  onOpenStarredRepos() {
    const username = this.state.user.login;
    /**
     * This is a a little special for starred repo API
     */
    const url = 'https://api.github.com' + '/users/' + username + '/starred';
    const repo = {
      url: url,
      title: username + "'s Starred",
    }
    this.props.navigator.push({id: 'repos', obj: repo});
  },

  renderOrg(org) {
    return (
      <TouchableOpacity onPress={() => {
          this.props.navigator.push({id: 'org', obj: org});
        }}>
        <Image style={styles.orgnizationsImage} source={{uri: org.avatar_url}}/>
      </TouchableOpacity>
    )
  },

  componentDidMount() {
    const user = this.props.user;
    GHService.fetchPromise(user.url)
      .then(res => {
        // check if API limit exceed
        if (res.status > 400) {
          const body = JSON.parse(res._bodyInit);
          const needLogin = body.message.indexOf('rate') != -1;
          if (needLogin) {
            this.props.navigator.push({
              id: 'login',
              title: 'API rate need login',
              sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
            });
          }
        }

        const resUser = JSON.parse(res._bodyInit);
        const detailUser = Object.assign(this.state.user, resUser);
        this.setState({
          user: detailUser,
        });

        this.props.onLoadUser && this.props.onLoadUser(this.state.user);

        return GHService.fetchPromise(detailUser.organizations_url);
      })
      .then(res => {
        const orgs = JSON.parse(res._bodyInit);
        if (Array.isArray(orgs) && orgs.length > 0) {
          this.state.user.orgs = orgs;
          this.setState({
            user: this.state.user,
          });
        }
      })
      .catch(err => {console.log('About promise err', err);});

    GHService.starredReposCount(user.login)
      .then(value => {
        this.state.user.starredCount = value;
        this.setState({
          user: this.state.user,
        });
      })

    if (GHService.isLogined()) {
      GHService.userFollowQuery(user.login)
        .then(value => {
          const status = value.status;
          const isFollowing = status < 400;
          this.state.user.isFollowing = isFollowing;
          this.setState({
            user: this.state.user,
          });
        });
    }
  },

  followButton() {
    const currentUser = GHService.currentUser();
    if (currentUser.login == this.state.user.login) {
      return null;
    }
    const isFollowing = this.state.user.isFollowing;
    let followBackgroundColor = '#5ca941';
    let followContentColor = 'white';
    let followAction = 'Follow';
    if (isFollowing) {
      followBackgroundColor = '#CECECE';
      followContentColor = Colors.black;
      followAction = 'Unfollow';
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

    return followStatus;
  },

  render() {
    const user = this.state.user;

    let userCompany;
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

    let userLocation;
    if (user.location) {
      userLocation = (
        <View style={styles.iconTextContainer}>
          <Icon
            name='ios-location-outline'
            size={ICON_SIZE}
            style={styles.icon}
            color={Colors.textGray}/>
          <Text style={styles.profileInfoLocation}>{user.location}</Text>
        </View>
      )
    }

    let userEmail;
    if (user.email) {
      userEmail = (
        <View style={styles.iconTextContainer}>
          <Icon
            name='ios-email-outline'
            size={ICON_SIZE}
            style={styles.icon}
            color={Colors.textGray}/>
          <Text
            style={styles.profileInfoEmailAndSite}
            onPress={this.onPressEmail}
            >{user.email}</Text>
        </View>
      )
    }

    let userBlog;
    if (user.blog) {
      userBlog = (
        <View style={styles.iconTextContainer}>
          <Icon
            name='social-rss-outline'
            size={ICON_SIZE}
            style={styles.icon}
            color={Colors.textGray}/>
          <Text
            style={styles.profileInfoEmailAndSite}
            onPress={this.onPressBlog}
            >{user.blog}</Text>
        </View>
      )
    }

    let userJoined;
    if (user.created_at) {
      const date = new Date(user.created_at).toISOString().slice(0, 10);
      const joined = 'Joined on ' + date;
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

    let userOrg;
    if (user.orgs) {
      userOrg = (
        <View style={{flexDirection: 'column'}}>
          <Text style={styles.orgnizationsText}>Organizations</Text>
          <View style={styles.orgnizations}>
            {user.orgs.map(this.renderOrg)}
          </View>
        </View>
      )
    }

    const followStatus = this.followButton();

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
        {userOrg}
        <View style={styles.status}>
          {followStatus}
          <View style={styles.statusInfo}>
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
            <TouchableOpacity onPress={this.onOpenStarredRepos} style={{flex: 1}}>
              <View style={styles.statusInfoTouch}>
                <Text style={styles.statusInfoTouchNum}>
                  {user.starredCount}
                </Text>
                <Text style={styles.statusInfoTouchDes}>
                  Starred
                </Text>
              </View>
            </TouchableOpacity>
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
          </View>
        </View>
      </View>
   )
  }
});

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
    backgroundColor: 'lightGray',
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
    color: Colors.blue,
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
    backgroundColor: 'lightGray',
  },
  status: {
    flexDirection: 'column',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 10,
    paddingTop: 10,
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

});

module.exports = {
  UserComponent: UserComponent,
  AboutComponent: AboutComponent
};
