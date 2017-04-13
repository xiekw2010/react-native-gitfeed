'use strict'

import * as nv from '../actions/navigation'

const initialState = {
  rootTab: {
    id: 'HomePage',
  }
}

export const navigation = (state = initialState, action) => {
  switch (action.type) {
    case nv.ROOT_SWITCH_TAB:
      return { ...state, rootTab: action.rootTab }
  }

  return state
}
