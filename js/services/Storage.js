/**
 * Created by xiekaiwei on 16/8/24.
 */

import { AsyncStorage } from 'react-native'
import Parse from 'parse/react-native'

const CURRENT_USER_KEY = 'CURRENT_USER_KEY_GITFEED'
const SEARCH_HISTORY_KEY = 'SEARCH_HISTORY_KEY'

export const saveUser = async user => {
  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  return user
}

export const getCurrentUser = async() => {
  const userString = await AsyncStorage.getItem(CURRENT_USER_KEY)
  return JSON.parse(userString)
}

export const getSearchHistory = async() => {
  return await _getAllObjects(SEARCH_HISTORY_KEY, obj => !!obj && obj.length > 0, 4)
}

export const insertSearchRecord = async(item) => {
  if (!item || !item.length) return
  return await _insertObject(SEARCH_HISTORY_KEY, item, item => item, true)
}

export const removeSearchRecord = async(item) => {
  if (item) {
    return await _removeObject(SEARCH_HISTORY_KEY, item, item => item)
  } else {
    return await AsyncStorage.multiRemove([SEARCH_HISTORY_KEY])
  }
}

const _getAllKeys = async(key) => {
  const allKeys = await AsyncStorage.getItem(key)
  return JSON.parse(allKeys) || []
}

const _getAllObjects = async(key, prd = obj => !!obj, maxCount = 1000) => {
  const allKeys = await _getAllKeys(key)
  if (!allKeys) return null

  let allObjs = await AsyncStorage.multiGet(allKeys)
  if (!allObjs) return null


  allObjs = allObjs
    .map(kv => JSON.parse(kv[1]))
    .reduce((a, b) => a.concat(b), [])
    .filter(prd)
  if (allKeys.length > maxCount) {
    const nextAllKeys = allKeys.slice(0, maxCount)
    await AsyncStorage.setItem(key, JSON.stringify(nextAllKeys))
  }

  return allObjs
}

const _insertObject = async(key, obj, objAsKey = obj => obj.title, distinct = false) => {
  const objKey = objAsKey(obj)
  if (!objKey) throw new Error('Storage insert this obj does not have key!')

  let allKeys = await _getAllKeys(key)
  if (distinct) allKeys = allKeys.filter(k => objKey != k)

  allKeys.unshift(objKey)

  await AsyncStorage.setItem(key, JSON.stringify(allKeys))
  await AsyncStorage.setItem(objKey, JSON.stringify(obj))

  return obj
}

const _removeObject = async(key, obj, objAsKey = obj => obj.title) => {
  const objKey = objAsKey(obj)
  if (!objKey) throw new Error('Storage remove this obj does not have key!')

  let allKeys = await _getAllKeys(key)
  allKeys = allKeys.filter(k => k != objKey)

  await AsyncStorage.setItem(key, JSON.stringify(allKeys))
  await AsyncStorage.removeItem(objKey)

  return obj
}