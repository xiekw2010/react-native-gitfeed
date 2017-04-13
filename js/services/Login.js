/**
 * Created by xiekaiwei on 16/8/24.
 */

import Parse from 'parse/react-native'
import DeviceInfo from 'react-native-device-info'

const DEFAULT_ID = DeviceInfo.getUniqueID()

export const getCurrentUser = async() => {
  let currentUser = await Parse.User.currentAsync()
  if (!currentUser) {
    const uqId = DEFAULT_ID
    const userQuery = new Parse.Query(Parse.User)
    userQuery.equalTo('username', uqId)
    currentUser = await userQuery.first()

    if (!currentUser) {
      currentUser = await signUpDefaultUser()
    } else {
      currentUser = Parse.User.logIn(DEFAULT_ID, DEFAULT_ID)
    }
  }

  return currentUser
}

const signUpDefaultUser = async() => {
  const user = new Parse.User()
  user.set('username', DEFAULT_ID)
  user.set('password', DEFAULT_ID)
  user.set('platform', DeviceInfo.getSystemName())
  return await user.signUp()
}

export const syncUserInfo = async(key, data) => {
  if (!key || !data) return

  const currentUser = await getCurrentUser()
  currentUser.set(key, data)
  return await currentUser.save()
}

export const getUserInfo = () => {

}