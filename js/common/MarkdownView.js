'use strict'

import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native'
import Color from './Colors'
import MDWebView from './markdown'

class MarkdownView extends Component {
  constructor() {
    super()
    this.state = {
      md: ''
    }
  }

  componentDidMount() {
    const self = this
    fetch('https://github.com/sindresorhus/github-markdown-css/blob/gh-pages/readme.md')
      .then(res => res.text())
      .then(md => {
        self.setState({ md: md, })
      })
      .catch(err => console.log('err is', err))
  }


  render() {
    const { md } = this.state

    const article = md.slice(md.indexOf('<article'), md.indexOf('article>') + 'article>'.length)

    return (
      <MDWebView style={{ flex: 1 }}>
        {article}
      </MDWebView>
    );
  }
}

module.exports = MarkdownView

module.exports.__cards__ = (define) => {
  define('Gray', (state = true, update) =>
    <MarkdownView  />)
}