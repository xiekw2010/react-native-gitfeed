import React, {
  Component,
  PropTypes,
} from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  Image,
  TouchableOpacity,
} from 'react-native'
import { NavigationStyles } from '@exponent/ex-navigation'

class Playground extends React.Component {
  constructor() {
    super()
    const content = []
    const define = (name, render) => {
      content.push(<Example key={name} render={render}/>)
    }

    //    var Module = require('./common/MarkdownView')
    //    var Module = require('./common/SearchHistory')
    //    var Module = require('./common/IconCell')

    //    Module.__cards__(define)
    this.state = { content }
  }

  render() {
    return (
//      <View style={{ backgroundColor: '#336699', flex: 1, marginTop: 20}}>
//      </View>

      <IssueDetailPage route={{params: {repo: {name: 'xiekw2010/DXPopover', html_url: 'https://github.com/exponent/ex-navigation/issues/326'}}}}/>
    )
  }
}

class Example extends React.Component {
  state = {
    inner: null
  }

  render() {
    const content = this.props.render(this.state.inner, (inner) => this.setState({ inner }))
    return (
      <View>
        {content}
      </View>
    )

  }
}

module.exports = Playground
