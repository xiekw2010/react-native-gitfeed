import {
  createRouter,
} from '@exponent/ex-navigation'

import RepoDetailPage from '../pages/RepoDetailPage'
import HomePage from '../pages/HomePage'
import IssueDetailPage from '../pages/IssueDetailPage'
import SearchPage from '../pages/SearchPage'
import WebView from '../common/WebView'
import LoginPage from '../pages/LoginPage'
import Playground from '../Playground'
import UserDetailPage from '../pages/UserDetailPage'
import NotificationPage from '../pages/NotificationPage'
import PersonPage from '../pages/PersonPage'
import TrendPage from '../pages/TrendPage'
import ShowcasePage from '../pages/ShowcasePage'
import FamousPage from '../pages/FamousPage'
import { RepoListView, UserListView } from '../common/DetailListView'

export default createRouter(() => ({
  RepoDetail: () => RepoDetailPage,
  Home: () => HomePage,
  IssueDetail: () => IssueDetailPage,
  Search: () => SearchPage,
  Web: () => WebView,
  Login: () => LoginPage,
  Playground: () => Playground,
  UserDetail: () => UserDetailPage,
  UserList: () => UserListView, // { url: 'https://api.github.com/users/getify/followers?per_page=100' }
  RepoList: () => RepoListView,
  Notification: () => NotificationPage,
  Me: () => PersonPage,
  Trend: () => TrendPage,
  Showcase: () => ShowcasePage,
  Famous: () => FamousPage
}))