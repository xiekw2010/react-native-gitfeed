'use strict'

import React, {
  Component,
  PropTypes,
} from 'react'
import {
  Platform,
  View,
  Linking,
} from 'react-native'
import { getRequest } from '../services/GithubServices'
import AlertStyle from '../constants/Alerts'

class NotificationPage extends Component {
  state = {
    notifications: []
  }

  componentDidMount() {
    this.getNotifications()
  }

  async getNotifications() {
    try {
      const notifications = await geatRequest('/notifications')
      this.setState({ notifications, })
    } catch (err) {
      this.handleError(err)
    }
  }

  handleError(err) {
    if (~err.message.indexOf('authentication')) {
      const { navigator } = this.props
      navigator.showLocalAlert('You need to login first', AlertStyle.warning)
      setTimeout(_ => navigator.push('Login', {
        didLogin: this.getNotifications.bind(this)
      }), 2000)
    }
  }

  render() {
    console.log('this.notifications is', this.state.notifications)
    return <View></View>
  }
}

NotificationPage.propTypes = {}
NotificationPage.defaultProps = {}

export default NotificationPage


