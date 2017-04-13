/**
 * Created by xiekaiwei on 16/8/24.
 */

const Crypto = require('crypto-js')

const BASE_URL = "http://bonwechat.com"
//const BASE_URL = "http://localhost:7001"

const errorMessages = (res) => `${res.status} ${res.statusText}`

function check401(res) {
  if (res.status === 401) {
    return Promise.reject(errorMessages(res))
  }
  return res
}

function check404(res) {
  if (res.status === 404) {
    return Promise.reject(errorMessages(res))
  }
  return res
}

function jsonParse(res) {
  return res.json()
}

function errorMessageParse(res) {
  const { code, msg } = res
  if (code > 200) {
    return Promise.reject(msg)
  }
  return res
}

function xFetch(path, options) {
  return fetch(path, options)
    .then(check401)
    .then(check404)
    .then(jsonParse)
    .then(errorMessageParse)
}

function getFetch(path) {
  let URL = path
  if (!/^http.*/.test(URL)) URL = BASE_URL + path

  return xFetch(URL, {
    headers: {
      'WECHATLOOK-HEADER': Crypto.HmacSHA1(URL, 'register.wechatlook_rn.js')
    }
  })
}

export default getFetch
