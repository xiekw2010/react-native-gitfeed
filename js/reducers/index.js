import {  NavigationReducer } from '@exponent/ex-navigation'
import { combineReducers } from 'redux'

const notifications = require('./notifications')
const login = require('./login')
const search = require('./search')
const language = require('./language')

export default combineReducers({
  navigation: NavigationReducer,
  ...notifications,
  ...login,
  ...search,
  ...language
})