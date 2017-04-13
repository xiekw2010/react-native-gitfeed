import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  ActionSheetIOS,
} from 'react-native'
import defaultHtml from '../common/markdown/issue-html'
import WebView from '../common/WebView'
import Layout from '../constants/Layout'
import { LoadingPlaceholder, ErrorPlaceholder } from '../common/Placeholder'

class IssueDetailPage extends Component {
  static route = {
    navigationBar: {
      title(params) {
        if (params.repo) return `${params.repo.title}`
      },
    },
  }

  state = {
    loading: true,
    error: null,
    source: { html: '', baseUrl: 'about:blank', }
  }

  _issueHtml(originHtml) {
    const start = '<div class="discussion-header">'
    const end = '<div class="discussion-block-header">'
    const article = originHtml.slice(originHtml.indexOf(start),
      originHtml.indexOf(end))

    return defaultHtml.replace('$body', article)
  }

  async _renderHtml(html_url) {
    if (html_url) {
      this.setState({ loading: true, error: null })

      try {
        let html = await fetch(html_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4 AliApp(JU'
          }
        })
        if (html.status > 200) {
          throw new Error(`Issue not found ${html_url}`)
        } else {
          html = await html.text()
        }

        this.setState({
          source: {
            html: this._issueHtml(html),
            baseUrl: 'about:blank',
          },
          loading: false
        })
      } catch (error) {
        this.setState({
          loading: false,
          error
        })
      }
    }
  }

  async componentDidMount() {
    const { repo }  = this.props.route.params
    await this._renderHtml(repo.html_url)
  }

  render() {
    const { loading, error } = this.state
    const { repo }  = this.props.route.params

    if (loading) {
      return <LoadingPlaceholder/>
    }

    if (error) {
      return <ErrorPlaceholder
        title='Oops! Load issue failed'
        desc={error.message}
        onPress={_ => this._renderHtml(repo.name)}
      />
    }

    return (
      <WebView
        source={this.state.source}
        contentInset={Layout.contentInset}
      />
    )
  }
}

IssueDetailPage.propTypes = {
  route: PropTypes.object
}
IssueDetailPage.defaultProps = {
  route: { params: {} }
}

export default IssueDetailPage

