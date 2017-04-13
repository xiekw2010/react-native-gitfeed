'use strict'

import * as sch from '../actions/search'

const defaultState = {
  hotTags: ['react-native', 'redux', 'parse-server'],
  history: [],
  searchText: '',
}

export const search = (state = defaultState, action) => {
  switch (action.type) {
    case sch.GET_HOT_TAGS: {
      if (action.tags) {
        return { ...state, hotTags: action.tags }
      }
    }
    case sch.GET_SEARCH_HISTORY:
      return Object.assign({}, state, { history: action.history })
    case sch.SEARCH_START:
      return Object.assign({}, state, {
        searchText: action.searchText,
      })
  }

  return state
}