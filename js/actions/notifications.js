'use strict'

const Platform = require('Platform')
const VibrationIOS = require('VibrationIOS')
const { updateInstallation } = require('./installation')
const PushNotification = require('react-native-push-notification');

function normalizeData(s) {
  if (s && typeof s === 'object') {
    return s
  }
  try {
    return JSON.parse(s)
  } catch (e) {
    return {}
  }
}

async function storeDeviceToken(deviceToken) {
  const pushType = Platform.OS === 'android' ? 'gcm' : undefined
  await updateInstallation({
    pushType,
    deviceToken,
    deviceTokenLastModified: Date.now(),
  })
  return {
    type: 'REGISTERED_PUSH_NOTIFICATIONS',
  }
}

function checkPushNotifications() {
  return dispatch => {
    PushNotification.checkPermissions(permission => {
      const disabled = permission.alert < 1
      dispatch({
        type: 'CHECK_PUSH_NOTIFICATIONS',
        disabled
      })
    })
  }
}

function turnOnPushNotifications() {
  return {
    type: 'TURNED_ON_PUSH_NOTIFICATIONS',
  }
}

function skipPushNotifications() {
  return {
    type: 'SKIPPED_PUSH_NOTIFICATIONS',
  }
}

function receivePushNotification(notification) {
  return (dispatch) => {
    let { foreground, message } = notification
    const data = normalizeData(notification.data)

    message = message.split(',')[0]

    if (!foreground) {
      dispatch(showNotificationView(message))
    }

    if (foreground) {
      dispatch(showNotificationView(message))


      if (Platform.OS === 'ios') {
        VibrationIOS.vibrate()
      }
    }

    if (data.e /* ephemeral */) {
      return
    }

    const timestamp = new Date().getTime()
    dispatch({
      type: 'RECEIVED_PUSH_NOTIFICATION',
      notification: {
        text: message,
        url: data.url,
        time: timestamp,
      },
    })
  }
}

function markAllNotificationsAsSeen() {
  return {
    type: 'SEEN_ALL_NOTIFICATIONS',
  }
}

module.exports = {
  turnOnPushNotifications,
  storeDeviceToken,
  skipPushNotifications,
  receivePushNotification,
  markAllNotificationsAsSeen,
  checkPushNotifications
}
