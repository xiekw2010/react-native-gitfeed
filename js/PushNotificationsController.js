'use strict'

import React, {
  Component,
  PropTypes,
} from 'react'
import {
  Platform,
  View,
  AppState,
  PushNotificationIOS
} from 'react-native'
import { connect } from 'react-redux'
import PushNotification from 'react-native-push-notification'
import {
  storeDeviceToken,
  receivePushNotification,
  updateInstallation,
  checkPushNotifications,
  loadNotifications
} from './actions'

class AppBadgeController extends React.Component {
  constructor() {
    super()
    this.handleAppStateChange = this.handleAppStateChange.bind(this)
  }

  handleAppStateChange(appState) {
    if (appState === 'active') {
      this.updateAppBadge()
      this.props.dispatch(loadNotifications())
    }
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange)

    const { dispatch } = this.props
    dispatch(checkPushNotifications())
    dispatch(loadNotifications())
    
    PushNotification.configure({
      onRegister: ({ token }) => {
        dispatch(storeDeviceToken(token))
        dispatch(checkPushNotifications())
      },
      onNotification: notif => dispatch(receivePushNotification(notif)),
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
      requestPermissions: this.props.enabled,
    })

    this.updateAppBadge()
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.enabled && this.props.enabled) {
      PushNotification.requestPermissions()
    }
  }

  updateAppBadge() {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(0)
      updateInstallation({ badge: 0 })
    }
  }

  render() {
    return null
  }
}

function select(store) {
  return {
    enabled: store.notifications.enabled === true,
  }
}

module.exports = connect(select)(AppBadgeController)
