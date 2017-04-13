import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  WebView,
  View,
  TouchableOpacity,
  Text,
  Image,
  ActionSheetIOS,
  ProgressBarAndroid,
  ActivityIndicatorIOS,
  Platform,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Colors from '../constants/Colors'
import { ErrorPlaceholder } from '../common/Placeholder'

// TODO: 当页面打开个新链接的时候, 想打开个新的 webview, 这里好像不行
const WebComponent = React.createClass({
  PropTypes: {
    source: React.PropTypes.object,
  },

  getInitialState() {
    return {
      backAble: false,
      forwardAble: false,
      refreshAble: false
    }
  },

  onShare() {

  },

  render() {
    return (
      <WebView
        ref={(webView) => this.webView = webView}
        automaticallyAdjustContentInsets={false}
        {...this.props}
        renderError={(domain, code, desc) =>
            <ErrorPlaceholder
              title={`${domain}:${code} wrong`}
              desc={desc}
              onPress={_ => this.forceUpdate()}
            />
          }
      >
      </WebView>
    )
  },
})

const iconSize = 30
const WebToolBar = React.createClass({
  PropTypes: {
    goBack: React.PropTypes.func,
    goForward: React.PropTypes.func,
    onRefresh: React.PropTypes.func,
    backAble: React.PropTypes.bool,
    forwardAble: React.PropTypes.bool,
    refreshAble: React.PropTypes.bool
  },

  goBack() {
    this.props.backAble && this.props.goBack && this.props.goBack()
  },

  goForward() {
    this.props.forwardAble && this.props.goForward && this.props.goForward()
  },

  onRefresh() {
    this.props.refreshAble && this.props.onRefresh && this.props.onRefresh()
  },

  render() {
    const backOpacity = this.props.backAble ? 0.5 : 1.0
    const backColor = this.props.backAble ? Colors.green : Colors.lightGray

    const forwardOpacity = this.props.forwardAble ? 0.5 : 1.0
    const forwardColor = this.props.forwardAble ? Colors.green : Colors.lightGray

    const refreshOpacity = this.props.refreshAble ? 0.5 : 1.0
    const refreshColor = this.props.refreshAble ? Colors.green : Colors.lightGray

    let bottom = 49
    if (Platform.OS === 'android') {
      bottom = 0
    }

    return (
      <View style={[styles.webViewToolBar, { bottom: bottom }]}>
        <View style={styles.webLeft}>
          <TouchableOpacity
            style={{ marginRight: 15 }}
            onPress={this.props.goBack}
            activeOpacity={backOpacity}>
            <Icon
              name='md-arrow-round-back'
              size={iconSize}
              style={styles.icon}
              color={backColor}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={this.props.onRefresh}
          activeOpacity={refreshOpacity}>
          <Icon
            name='md-refresh'
            size={iconSize}
            style={styles.icon}
            color={refreshColor}
          />
        </TouchableOpacity>
      </View>
    )
  }
})

module.exports = WebComponent


const styles = StyleSheet.create({
  repoToolBar: {
    backgroundColor: '#FAFAFA',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#F2F2F2',
    shadowColor: '#ccc',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3
  },
  action: {
    borderStyle: 'solid',
    borderColor: '#F2F2F2',
    borderRadius: 3,
    flexDirection: 'row',
    marginRight: 10,
    shadowColor: '#ccc',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    backgroundColor: "#F2F2F2"
  },
  leftAction: {
    padding: 3,
    backgroundColor: "#F2F2F2",
    flexDirection: 'row'
  },
  rightAction: {
    padding: 3,
    backgroundColor: "white"
  },
  actionText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  webViewToolBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    height: 40,
    position: 'absolute',
    left: 0,
    bottom: 49,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  webLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  icon: {
    width: iconSize,
    height: iconSize
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})