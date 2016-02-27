const config = require('../config');
const {EventEmitter} = require('events');
const React = require('react-native');
const DXUtils = require('../commonComponents/DXRNUtils');
const MockFeedJSON = require('./mockFeed');
const base64 = require('base-64');

const {
  AsyncStorage,
  Navigator,
} = React;

const API_PATH = 'https://api.github.com';
const AUTH_URL_PATH = API_PATH + '/authorizations';
const GH_USER_KEY = 'GH_USER_KEY';
const EMPTY_TOKEN = {
  id: '',
  token: ''
};
const EMPTY_USER = {
  login: '',
  password: '',
  avatar: '',
  userId: '',
  url: '',
  tokenInfo: EMPTY_TOKEN,
};
let GLOBAL_USER = EMPTY_USER;

/*
  User has two state:
  1. onboard (just enter username)
  2. login (will has the accessToken)
*/
class GithubService extends EventEmitter {
  constructor() {
    super();
  }

  apiPath() {
    return API_PATH;
  }

  queryLoginState() {
    return (
      AsyncStorage.getItem(GH_USER_KEY)
        .then(result => {
          if (result) {
            console.log('GHService start user is:' + result);
            GLOBAL_USER = JSON.parse(result);
          }
          return GLOBAL_USER;
        })
        .catch(err => {
          console.log('loginErr is: ' + err);
        })
      );
  }

  isOnboard() {
    return GLOBAL_USER.login.length > 0;
  }

  onboard(username) {
    const path = API_PATH + '/users/' + username.trim();
    const validPromise = this.fetchPromise(path);
    return validPromise.then(value => {
      const status = value.status;
      const isValid = status < 400;
      const json = JSON.parse(value._bodyInit);
      if (isValid) {
        GLOBAL_USER.login = json.login;
        GLOBAL_USER.avatar = json.avatar_url;
        GLOBAL_USER.userId = json.id;
        GLOBAL_USER.url = json.url;
        Object.assign(GLOBAL_USER, json);
        SingleGHService._setNeedSaveGlobalUser();

        return GLOBAL_USER;
      } else {
        GLOBAL_USER.login = username;
        const bodyMessage = json.message;

        throw new Error(bodyMessage);
      }
    });
  }

  isLogined() {
    return this.isOnboard() && GLOBAL_USER.tokenInfo.token.length > 0;
  }

  login(name, pwd) {
    const bytes = name.trim() + ':' + pwd.trim();
    const encoded = base64.encode(bytes);

    return (
      fetch(AUTH_URL_PATH, {
        method: 'POST',
        headers: {
          'Authorization' : 'Basic ' + encoded,
          'User-Agent': 'GithubFeed',
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          'client_id': config.GithubClientId,
          'client_secret': config.GithubClientSecret,
          'scopes': config.scopes,
          'note': 'not abuse'
        })
      })
        .then((response) => {
          const isValid = response.status < 400;
          const body = response._bodyInit;
          const json = JSON.parse(body);
          if (isValid) {
            const token = json.token;
            const tokenId = json.id;
            console.log('body is: ' + JSON.stringify(body), 'json is: ', json, 'token is: ', token);
            let tokenInfo = {};
            tokenInfo.id = tokenId;
            tokenInfo.token = token;
            GLOBAL_USER.tokenInfo = tokenInfo;
            GLOBAL_USER.Login = name;
            GLOBAL_USER.password = pwd;
            GLOBAL_USER.url = json.url;

            const path = API_PATH + '/users/' + GLOBAL_USER.Login.trim();
            return this.fetchPromise(path);
          } else {
            throw new Error(json.message);
          }
        })
        .then(value => {
          const status = value.status;
          const isValid = status < 400;
          const json = JSON.parse(value._bodyInit);
          if (isValid) {
            GLOBAL_USER.login = json.login;
            GLOBAL_USER.avatar = json.avatar_url;
            GLOBAL_USER.userId = json.id;
            GLOBAL_USER.url = json.url;
            Object.assign(GLOBAL_USER, json);

            return SingleGHService._setNeedSaveGlobalUser();
          }
        })
    )
  }

  logout(cb) {
    fetch(AUTH_URL_PATH + '/' + GLOBAL_USER.tokenInfo.id, {
      method: 'DELETE',
      headers: this.tokenHeader()
    })
      .catch(err => {
        console.log('logout err is: ' + err);
      });

    GLOBAL_USER = EMPTY_USER;
    AsyncStorage.removeItem(GH_USER_KEY);
    DXUtils.clearCookie();

    cb && cb();

    SingleGHService.emit('didLogout');
  }

  tokenHeader() {
    let tHeader = {
      'User-Agent': config.userAgent,
      'Accept': 'application/vnd.github.v3+json'
    }
    if (this.isLogined()) {
      tHeader.Authorization = 'token ' + GLOBAL_USER.tokenInfo.token;
    }
    console.log('token header is: ' + JSON.stringify(tHeader));

    return tHeader;
  }

  feedsPath() {
    let feedsURL = API_PATH + '/users/' + GLOBAL_USER.login + '/received_events';
    return feedsURL;
  }

  getNotifications() {
    if (!this.isLogined()) return;

    return (
      fetch(API_PATH + '/notifications', {
        headers: this.tokenHeader(),
      })
    )
  }

  checkNeedLoginWithPromise(promiseFunc, navigator) {
    if (!this.isLogined()) {
      navigator.push({
        id: 'login',
        sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
        title: 'Action need login',
        nextPromiseFunc: promiseFunc,
      });
    } else {
      return promiseFunc();
    }
  }

  getRepoHTMLString(userAndRepo) {
    let tokenHeader = this.tokenHeader();
    tokenHeader.Accept = 'application/vnd.github.VERSION.raw';
    const repoURL = API_PATH + '/repos/' + userAndRepo + '/readme';

    return fetch(repoURL, {
      headers: tokenHeader,
    })
  }

  _setNeedSaveGlobalUser() {
    return AsyncStorage.setItem(GH_USER_KEY, JSON.stringify(GLOBAL_USER));
  }

  currentUser() {
    return GLOBAL_USER;
  }

  fetchPromise(url) {
    return fetch(url, {
      headers: this.tokenHeader(),
    });
  }

  // repo: repo_full_name, action: 'GET', 'DELETE', 'PUT'
  repoStarQuery(repo, action) {
    const path = API_PATH + '/user/starred/' + repo;
    const method = action || 'GET';
    return fetch(path, {
      method: method,
      headers: this.tokenHeader(),
    })
  }

  repoWatchQuery(repo, action) {
    let path = API_PATH + '/repos/' + repo + '/subscription';
    const method = action || 'GET';
    console.log('watchquery path', path, method);
    if (method != 'GET') {
      path = API_PATH + '/user/subscriptions' + '/' + repo;
    }
    return fetch(path, {
      method: method,
      headers: this.tokenHeader(),
    })
  }

  userFollowQuery(targetUser, action) {
    let path = API_PATH + '/users/' + GLOBAL_USER.login + '/following' + targetUser;
    const method = action || 'GET';
    if (this.isLogined() || method !== 'GET') {
      path = API_PATH + '/user/following/' + targetUser;
    }
    return fetch(path, {
      method: method,
      headers: this.tokenHeader(),
    })
  }

  notifications() {
    const path = API_PATH + '/notifications';
  }

  starredRepos(username) {
    if (username.length == 0) {
      console.log('Error for username', username);
      return;
    }
    const path = API_PATH + '/' + username + '/starred';
    return fetch(path, {
      headers: this.tokenHeader(),
    })
  }

  starredReposCount(username) {
    const path = API_PATH + '/users/' + username + '/starred?per_page=1';
    return fetch(path, {
      headers: this.tokenHeader(),
    })
      .then(value => {
        const status = value.status;
        let count = '';
        if (status < 400) {
          const links = value.headers.map.link && value.headers.map.link[0];
          if (links) {
            const reg = /&page=(\d+)\S+\s+rel="last"/g;
            const matchs = reg.exec(links);
            const end = matchs[1];
            if (end) {
              console.log('end page is', end);
              count = end;
            }
          }
        }

        return count;
      })
  }
}

const SingleGHService = new GithubService();

module.exports = SingleGHService;
