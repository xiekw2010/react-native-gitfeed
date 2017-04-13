import React, {
  Component,
  PropTypes,
  AsyncStorage
} from 'react'
import BlurView from './common/BlurView'
import WLApp from './WLApp'
import { Provider } from 'react-redux'
import store from './store/configureStore'
import Parse from 'parse/react-native'
import { serverURL } from './env'
//import Playground from './Playground'
import {
  NavigationContext,
  NavigationProvider,
} from '@exponent/ex-navigation'
import Router from './navigation/Router'
import {
  MenuContext,
} from 'react-native-popup-menu'

const navigationContext = new NavigationContext({
  router: Router,
  store: store,
})

const setup = () => {
  //  AsyncStorage.clear()

  // something for initialize
  //  Parse.initialize('oss-f8-app-2016')
  //  Parse.serverURL = `${serverURL}/parse`

  return () => {
    return (
      <Provider store={store}>
        {/*<Playground />*/}
        <NavigationProvider context={navigationContext}>
          <MenuContext>
            <WLApp/>
          </MenuContext>
        </NavigationProvider>
      </Provider>
    )
  }
}

global.LOG = (...args) => {
  console.log('/------------------------------\\')
  console.log(...args)
  console.log('\\------------------------------/')
  return args[args.length - 1]
}

export default setup
