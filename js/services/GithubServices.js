import {
  AsyncStorage,
  Navigator,
} from 'react-native'
import base64 from 'base-64'
import xFetch from './xFetch'
import store from '../store/configureStore'

const CONFIG = {
  "GithubClientId": 'a1839c9372b5347cfa32',
  'GithubClientSecret': 'ab34a12fe52a3fbdfbc128945eab7c9c03d0b907',
  "scopes": ['public_repo', 'user', 'notifications'],
  'userAgent': 'GithubFeed',
  'baseUrl': 'https://api.github.com'
}

const LOGGER_PREFIX = '[GitFeed-GithubServices***]'

export const GHPath = p => {
  if (/^http.*/.test(p)) {
    return p
  }

  return 'https://api.github.com' + p
}

export const GHGetHeader = () => {
  const headers = {
    'User-Agent': CONFIG.userAgent,
    'Accept': 'application/vnd.github.v3+json',
  }

  const state = store.getState()
  const token = state.login.user.token
  if (token) {
    headers.Authorization = 'token ' + token
  }

  return headers
}

export const basicLogin = async(username, pwd, tfaToken) => {
  const bytes = username.trim() + ':' + pwd.trim()
  const encoded = base64.encode(bytes)

  return await xFetch(GHPath('/authorizations'), {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + encoded,
      'User-Agent': 'GithubFeed',
      'Content-Type': 'application/json; charset=utf-8',
      'X-GitHub-OTP': tfaToken
    },
    body: JSON.stringify({
      'client_id': CONFIG.GithubClientId,
      'client_secret': CONFIG.GithubClientSecret,
      'scopes': CONFIG.scopes,
      'note': 'not abuse'
    })
  })
}

export const getUserInfo = async(username) => {
  return await xFetch(GHPath(`/users/${username.trim()}`), {
    headers: GHGetHeader()
  })
}

/**
 *
 * @param path
 * @param options { noParse: false }
 */
export const getRequest = (path, options) => {
  return xFetch(GHPath(path), {
    headers: GHGetHeader()
  }, options)
}

/**
 *
 * @param repoName like 'xiekw2010/DXPopover'
 * @param method like 'GET', 'DELETE', 'PUT'
 * @param options { noParse: false }
 * @returns {*}
 */
export const repoStarQuery = async(repoName, method) => {
  let res = await xFetch(GHPath(`/user/starred/${repoName}`), {
    method,
    headers: GHGetHeader()
  }, { noParse: true })

  if (method === 'GET') {
    return res.status < 300
  } else {
    if (res.status < 300) {
      return true
    } else {
      throw new Error(`repo start failed ${res.status}`)
    }
  }
}

export const repoWatchQuery = async(repoName, method) => {
  const path = method === 'GET' ?
    GHPath(`/repos/${repoName}/subscription`) :
    GHPath(`/user/subscriptions/${repoName}`)

  const res = await xFetch(path, {
    method,
    headers: GHGetHeader()
  }, { noParse: true })

  if (method === 'GET') {
    return res.status < 300
  } else {
    if (res.status < 300) {
      return true
    } else {
      throw new Error(`repo watch failed ${res.status}`)
    }
  }
}

export const userFollowQuery = async(username, method) => {
  const login = store.getState().login.user.login
  if (!login) throw new Error(`${LOGGER_PREFIX} user not login!`)

  const path = method === 'GET' ?
    GHPath(`/users/${login}/following/${username}`) :
    GHPath(`/user/following/${username}`)

  const res = await xFetch(path, {
    method,
    headers: GHGetHeader()
  }, { noParse: true })

  if (method === 'GET') {
    return res.status < 300
  } else {
    if (res.status < 300) {
      return true
    } else {
      throw new Error(`${username} follow failed ${res.status}`)
    }
  }
}

export const starredReposCount = async(username) => {
  const path = GHPath(`/users/${username}/starred?per_page=1`)
  const res = await getRequest(path, { noParse: true })
  let count = 0
  if (res.status) {
    const links = res.headers.map.link && res.headers.map.link[0]
    if (links) {
      const reg = /&page=(\d+)\S+\s+rel="last"/g
      const matchs = reg.exec(links)
      const end = matchs[1]
      if (end) count = end
    }
  }
  return count
}

export const getNotifications = async() => {
  try {
    const res = await getRequest(`/notifications`)
    console.log('res is', res)
  } catch (err) {
    console.log('notification err is', err)
  }

  return null
}
