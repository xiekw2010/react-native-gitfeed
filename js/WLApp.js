'use strict'

import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  AppState,
  View,
  StatusBar,
  ActivityIndicator
} from 'react-native'
import CodePush from 'react-native-code-push'
import { connect } from 'react-redux'
import RootNavigation from './navigation/RootNavigation'
import { create } from './common/F8StyleSheet'
import { getUser, login } from './actions/login'
import { version } from './env'
import OnboardPage from './pages/OnboardPage'
//import PushNotificationsController from './PushNotificationsController'

class WLApp extends Component {
  componentDidMount() {
    // TODO: 清理本地所有数据
    //    storage.clearAll()

    const { dispatch } = this.props
    dispatch(getUser())

    AppState.addEventListener('change', this.handleAppStateChange)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  handleAppStateChange(appState) {
    if (appState === 'active' && !__DEV__) {
      CodePush.sync({ installMode: CodePush.InstallMode.ON_NEXT_RESUME })
    }
  }

  render() {
    const { isOnboard, loading } = this.props

    if (loading) {
      // TODO: A more beautiful loading like weibo avatar page should be
      return <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" animating={true}/>
      </View>
    }

    return isOnboard ? <RootNavigation/> : <OnboardPage/>
  }
}

const styles = create({
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  container: {
    flex: 1,
  },
})

const select = ({ login }) => {
  const { user } = login
  return {
    user,
    isOnboard: !!user.login && !!user.login.length,
    loading: login.loading
  }
}

export default connect(select)(WLApp)