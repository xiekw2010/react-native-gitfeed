'use strict'

import {
  getSearchHistory,
  insertSearchRecord,
  removeSearchRecord
} from '../services/Storage'

export const GET_HOT_TAGS = 'GET_HOT_TAGS'
export const GET_SEARCH_HISTORY = 'GET_SEARCH_HISTORY'
export const SEARCH_START = 'SEARCH_START'

export const getHotTags = () => {
  // Async get the TAGS
  return dispatch => {
    dispatch({
      type: GET_HOT_TAGS,
    })
  }
}

export const searchSearchHistory = async() => {
  const history = await getSearchHistory()
  return {
    type: GET_SEARCH_HISTORY,
    history
  }
}

export const enqueueSearchHistory = async(his) => {
  await insertSearchRecord(his)
  return await searchSearchHistory()
}

export const removeSearchHistory = async(his) => {
  await removeSearchRecord(his)
  return await searchSearchHistory()
}

/**
 *
 * from: 'TAG', 'HISTORY', 'INPUT'
 */
export const startSearch = (text, from = 'INPUT')=> {
  return {
    type: SEARCH_START,
    searchText: text,
    from: from
  }
}