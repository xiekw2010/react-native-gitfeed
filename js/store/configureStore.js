import {
  createNavigationEnabledStore,
  NavigationActions
} from '@exponent/ex-navigation'
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import promise from './promise'
import array from './array'
import analytics from './analytics'
import reducers from '../reducers'
import createLogger from 'redux-logger'
import Router from '../navigation/Router'

const createStoreWithNavigation = createNavigationEnabledStore({
  createStore,
  navigationStateKey: 'navigation',
})

const isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent
const logger = createLogger({
  predicate: (getState, action) => isDebuggingInChrome,
  collapsed: true,
  duration: true,
})

let store = createStoreWithNavigation(reducers, applyMiddleware(thunk, promise, array, analytics))
if (__DEV__) {
  store = createStoreWithNavigation(reducers, applyMiddleware(thunk, promise, array, analytics, logger))
}

if (isDebuggingInChrome) {
  window.store = store
}

export default store
export const goToPage = (pageName, params) => {
  let navigatorUID = store.getState().navigation.currentNavigatorUID;
  store.dispatch(NavigationActions.push(navigatorUID, Router.getRoute(pageName, params)))
}