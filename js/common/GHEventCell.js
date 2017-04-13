import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  View,
  Image,
  TouchableHighlight,
  TouchableOpacity
} from 'react-native'
import Colors from '../constants/Colors'
import { Text, LinkText, NormalText, Heading2 } from '../common/F8Text'
import ReadMore from './ReadMore'
import FadeIn from '@exponent/react-native-fade-in-image'
import Touchable from '../common/F8Touchable'

const GHCell = React.createClass({
  propTypes: {
    ghEvent: React.PropTypes.object,
  },

  actionForEvent(ghEvent) {
    let action = 'Started'
    if (ghEvent.type === 'ForkEvent') {
      action = 'Forked'
    } else if (ghEvent.type === 'WatchEvent') {
      action = 'Started'
    } else if (ghEvent.type === 'PushEvent') {
      action = 'Pushed'
    } else if (ghEvent.type === 'IssueCommentEvent') {
      let realActoin = ghEvent.payload.action
      action = realActoin + ' comment'
    } else if (ghEvent.type === 'PullRequestEvent') {
      let realActoin = ghEvent.payload.action
      action = realActoin + ' pull request'
    } else if (ghEvent.type === 'MemberEvent') {
      action = ghEvent.payload.action
    } else if (ghEvent.type === 'IssuesEvent') {
      let realActoin = ghEvent.payload.action
      action = realActoin + ' issue ' + '"' + ghEvent.payload.issue.title + '" '
    } else if (ghEvent.type === 'PullRequestReviewCommentEvent') {
      let realActoin = ghEvent.payload.action
      action = realActoin + ' pull request' + ' comment on'
    } else if (ghEvent.type === 'DeleteEvent') {
      action = 'Delete'
    } else if (ghEvent.type === 'CreateEvent') {
      action = 'Create'
    }

    return action
  },

  _renderTruncatedFooter(handlePress) {
    return (
      <Text style={{ marginTop: 5, color: Colors.textLink}}
            onPress={handlePress}>
        Read more
      </Text>
    );
  },

  _renderRevealedFooter(handlePress) {
    return (
      <Text style={{ marginTop: 5, color: Colors.textLink}}
            onPress={handlePress}>
        Show less
      </Text>
    );
  },

  detailComponentForEvent(ghEvent) {
    const { payload, type } = ghEvent
    let detail
    if (type === 'PushEvent') {
      const payloadCommits = payload.commits
      detail = payloadCommits && payloadCommits
          .map(commit => {
            const sha = commit.sha.slice(0, 6)
            return (
              <Text key={sha} style={[styles.linkText, { fontSize: 13 }]}
                    numberOfLines={0}>
                {sha + ' '}
                <Text style={[styles.commentText, { marginTop: 3 }]}>
                  {commit.message}
                </Text>
                {'\n'}
              </Text>
            )
          })
    } else if (type === 'IssueCommentEvent') {
      detail = payload.comment.body
    } else if (type === 'PullRequestEvent') {
      detail = payload.pull_request.title
    } else if (type === 'PullRequestReviewCommentEvent') {
      detail = payload.comment.body
    } else if (type === 'DeleteEvent' || type === 'CreateEvent') {
      detail = payload.ref_type + ' ' + payload.ref
    }

    if (detail) {
      return (
        <View style={styles.textDesContainer}>
          <ReadMore content={detail}/>
        </View>
      )
    }
  },

  _makeRepoHtml(repoName) {
    return `https://github.com/${repoName}/blob/master/README.md`
  },

  openTargetRepo() {
    const { ghEvent, navigator } = this.props
    if (ghEvent.repo) {
      navigator.push('RepoDetail', { repo: ghEvent.repo, })
    }
  },

  openAuthor() {
    const { ghEvent, navigator } = this.props
    const user = ghEvent.actor
    if (user) {
      navigator.push('UserDetail', { user })
    }
  },

  openWebEvent() {
    const { ghEvent, navigator } = this.props
    let targetRepo = ghEvent.repo
    switch (ghEvent.type) {
      case 'PushEvent':
        targetRepo.html_url = this._makeRepoHtml(targetRepo.name)
        break
      case 'IssuesEvent':
      case 'IssueCommentEvent': {
        targetRepo.html_url = ghEvent.payload.issue.html_url
        targetRepo.title = ghEvent.payload.issue.title
      }
        break
      case 'PullRequestEvent': {
        targetRepo.html_url = ghEvent.payload.pull_request.html_url
        targetRepo.title = ghEvent.payload.pull_request.title
      }
        break
      default:
        targetRepo.html_url = 'https://github.com'
    }

    navigator.push('IssueDetail', { repo: targetRepo })
  },

  cellAction() {
    const ghEvent = this.props.ghEvent
    switch (ghEvent.type) {
      case 'IssueCommentEvent':
      case 'IssuesEvent':
      case 'PullRequestEvent':
        return this.openWebEvent
      case 'PushEvent':
      default:
        return this.openTargetRepo
    }
  },

  timesAgo() {
    const ghEvent = this.props.ghEvent
    const currentDate = new Date()
    const ghDate = new Date(ghEvent.created_at)

    return this.timeDifference(currentDate.getTime(), ghDate.getTime())
  },

  timeDifference(current, previous) {
    var msPerMinute = 60 * 1000
    var msPerHour = msPerMinute * 60
    var msPerDay = msPerHour * 24
    var msPerMonth = msPerDay * 30
    var msPerYear = msPerDay * 365

    var elapsed = current - previous

    if (elapsed < msPerMinute) {
      return Math.round(elapsed / 1000) + ' seconds ago'
    }

    else if (elapsed < msPerHour) {
      return Math.round(elapsed / msPerMinute) + ' minutes ago'
    }

    else if (elapsed < msPerDay) {
      return Math.round(elapsed / msPerHour) + ' hours ago'
    }

    else if (elapsed < msPerMonth) {
      return 'about ' + Math.round(elapsed / msPerDay) + ' days ago'
    }

    else if (elapsed < msPerYear) {
      return 'about ' + Math.round(elapsed / msPerMonth) + ' months ago'
    }

    else {
      return 'about ' + Math.round(elapsed / msPerYear) + ' years ago'
    }
  },


  render() {
    const ghEvent = this.props.ghEvent
    // console.log('ghEvent is: ' + JSON.stringify(ghEvent))
    const author = ghEvent.actor
    const timesAgo = this.timesAgo()
    const targetRepo = ghEvent.repo

    let textContainer
    if (ghEvent.type === 'MemberEvent') {
      const to = ' to '
      textContainer = (
        <Text style={styles.textActionContainer} numberOfLines={2}>
          <LinkText onPress={this.openAuthor}>
            {author.login + ' '}
            <Heading2>
              {this.actionForEvent(ghEvent) + ' '}
              <LinkText onPress={this.openTargetUser}>
                {ghEvent.payload.member.login}
                <NormalText>
                  {to}
                  <LinkText onPress={this.openTargetRepo}>
                    {targetRepo.name}
                  </LinkText>
                </NormalText>
              </LinkText>
            </Heading2>
          </LinkText>
        </Text>
      )
    } else {
      textContainer = (
        <Text style={styles.textActionContainer} numberOfLines={0}>
          <Heading2>
            {this.actionForEvent(ghEvent) + ' '}
            <LinkText onPress={this.openTargetRepo}>
              {targetRepo.name}
            </LinkText>
          </Heading2>
        </Text>
      )
    }

    return (
      <Touchable onPress={this.cellAction()}>
        <View style={styles.cellContentView}>
          <View style={styles.cellUp}>
            <TouchableOpacity onPress={this.openAuthor}>
              <FadeIn>
                <Image
                  source={{ uri: author.avatar_url }}
                  style={styles.avatar}
                />
              </FadeIn>
            </TouchableOpacity>
            <Text style={styles.username} onPress={this.openAuthor}>
              {author.login}
            </Text>
            <Text style={styles.createAt}>{timesAgo}</Text>
          </View>
          {textContainer}
          {this.detailComponentForEvent(ghEvent)}
          <View style={styles.sepLine}/>
        </View>
      </Touchable>
    )
  },
})

const styles = StyleSheet.create({
  cellContentView: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'stretch',
  },
  cellUp: {
    margin: 10,
    height: 40,
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: Colors.imagePlaceholder
  },
  username: {
    marginLeft: 10,
    color: '#4078C0',
    fontSize: 15,
  },
  textActionContainer: {
    margin: 10,
    marginTop: 7,
    marginBottom: 5,
    marginLeft: 10,
  },
  textDesContainer: {
    margin: 10,
    marginTop: 0,
    marginLeft: 25,
    borderStyle: 'dashed',
  },
  commentText: {
    color: Colors.textGray,
  },
  createAt: {
    marginLeft: 10,
    marginTop: 2,
    fontSize: 11,
    color: Colors.textGray,
  },
  sepLine: {
    backgroundColor: Colors.cellBorder,
    height: StyleSheet.hairlineWidth,
  },
})

module.exports = GHCell
