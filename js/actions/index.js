'use strict'

// Note: 这里只能用 CMD 的方式来加载每个 actions 里的对象, 原因参见 http://es6.ruanyifeng.com/#docs/module

const login = require('./login')
const notifications = require('./notifications')
const installation = require('./installation')
const parse = require('./parse')
const navigation = require('./navigation')
const search = require('./search')
const language = require('./language')

module.exports = {
  ...login,
  ...notifications,
  ...installation,
  ...parse,
  ...navigation,
  ...search,
  ...language
}
