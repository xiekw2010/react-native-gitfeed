import { basicLogin, getUserInfo } from '../services/GithubServices'
import { saveUser, getCurrentUser } from '../services/Storage'

export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS'
export const USER_ONBOARD = 'USERG_ONBOARD'
export const USER_ONBOARD_CHECKING = 'USER_ONBOARD_CHECKING'

export const onboard = async(user) => {
  const savedUser = await saveUser(user)
  return {
    type: USER_ONBOARD,
    user: savedUser
  }
}

export const getUser = () => {
  return dispatch => {
    dispatch({
      type: USER_ONBOARD_CHECKING
    })
    getCurrentUser()
      .then(user => {
        dispatch({
          type: USER_ONBOARD,
          user,
        })
      })
  }
}

export const login = async(user) => {
  if (user.token) {
    await saveUser(user)
    return {
      type: USER_LOGIN_SUCCESS,
      user
    }
  }

  return null

  // TODO: when user enter his profile then refresh it
  const detailUser = await getUserInfo(login)
  user = {
    ...user,
    avatar: detailUser.avatar_url,
    userId: detailUser.id,
    url: detailUser.url
  }

  return {
    type: USER_LOGIN_SUCCESS,
    user
  }
}

