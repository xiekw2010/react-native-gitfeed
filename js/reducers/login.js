import * as lg from '../actions/login'


/**
 *
 * @type {{user: {username: null, token: null, pwd: null, avatar: null, userId: null, url: null}}}
 */
const initialLogin = {
  user: {
    login: null,
    token: null,
    pwd: null,
    avatar: null,
    userId: null,
    url: null,
  },
  loading: false
}

export const login = (state = initialLogin, action) => {
  switch (action.type) {
    case lg.USER_LOGIN_SUCCESS:
    case lg.USER_ONBOARD:
      return { ...state, user: { ...state.user, ...action.user }, loading: false}
    case lg.USER_ONBOARD_CHECKING:
      return { ...state, loading: true }
  }

  return state
}

