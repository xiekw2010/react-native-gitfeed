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
import defaultHtml from '../common/markdown/default-html'
import WebView from '../common/WebView'
import Layout from '../constants/Layout'
import { LoadingPlaceholder, ErrorPlaceholder } from '../common/Placeholder'
import { getRequest } from '../services/GithubServices'
import ActionBar, { REPO_ACTION_BAR_HEIGHT } from './RepoActionBar'
import { withNavigation } from '@exponent/ex-navigation'

const guessRepoHtml = repoName =>
  `https://github.com/${repoName}/blob/master/README.md`

@withNavigation
class RepoDetailPage extends Component {
  static route = {
    navigationBar: {
      title(params) {
        if (params.repo) return `${params.repo.name}`
      },
    },
  }

  state = {
    loading: true,
    error: null,
    source: { html: '', baseUrl: 'about:blank', }
  }

  _readmeHtml(originHtml, repoName) {
    const end = 'article>'
    const article = originHtml.slice(originHtml.indexOf('<article'),
      originHtml.indexOf(end) + end.length)

    let result = article

    let imgs = []
    article.split('<img').forEach(imgTag => {
      const imgReg = new RegExp(` src=("/${repoName}.*") alt.*`)
      const ary = imgReg.exec(imgTag)
      if (ary && ary.length > 1) {
        imgs.push(ary[1])
      }
    })

    imgs.forEach(img => {
      const rawImg = img.slice(1, -1)
      result = result.replace(rawImg, 'https://raw.githubusercontent.com' + rawImg.replace('/raw', ''))
    })

    return defaultHtml.replace('$body', result)
  }

  async _renderHtml(repoName) {
    if (repoName) {
      this.setState({ loading: true, error: null })
      let html_url = guessRepoHtml(repoName)
      try {
        let html = await fetch(html_url)
        if (html.status > 200) {
          let res = await getRequest(`/repos/${repoName}/readme`)
          if (res.html_url) {
            html_url = res.html_url
            html = await fetch(html_url)
            html = await html.text()
          }
        } else {
          html = await html.text()
        }

        this.setState({
          source: {
            html: this._readmeHtml(html, repoName),
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

  componentDidMount() {
    const { repo }  = this.props
    const name = repo.full_name || repo.name
    this._renderHtml(name)
  }

  render() {
    const { loading, error } = this.state
    const { repo, navigator }  = this.props

    if (loading) {
      return <LoadingPlaceholder/>
    }

    if (error) {
      return <ErrorPlaceholder
        title='Oops! Load readme failed'
        desc={error.message}
        onPress={_ => this._renderHtml(repo.name)}
      />
    }

    const contentInset = {
      ...Layout.contentInset,
      top: Layout.contentInset.top + REPO_ACTION_BAR_HEIGHT
    }

    return (
      <View style={{flex: 1}}>
        <WebView
          style={{flex: 1}}
          source={this.state.source}
          contentInset={contentInset}
        />
        <ActionBar
          style={styles.actionBar}
          repo={repo}
          navigator={navigator}
        />
      </View>
    )
  }
}

RepoDetailPage.propTypes = {}
RepoDetailPage.defaultProps = {}

const styles = StyleSheet.create({
  actionBar: {
    position: 'absolute',
    top: Layout.contentInset.top,
    left: 0,
  }
})

export default RepoDetailPage

