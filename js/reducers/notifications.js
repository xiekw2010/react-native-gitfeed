/**
 * Copyright 2016 Facebook, Inc.
 *
 * You are hereby granted a non-exclusive, worldwide, royalty-free license to
 * use, copy, modify, and distribute this software in source code or binary
 * form for use in connection with the web services and APIs provided by
 * Facebook.
 *
 * As with any software that integrates with the Facebook platform, your use
 * of this software is subject to the Facebook Developer Principles and
 * Policies [http://developers.facebook.com/policy/]. This copyright notice
 * shall be included in all copies or substantial portions of the software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE
 *
 * @flow
 */

'use strict';

var Platform = require('Platform');

const initialState = {
  enabled: Platform.OS === 'ios' ? null : true,
  registered: false,
  disabled: false,
  server: []
};

export const notifications = (state = initialState, action) => {
  switch (action.type) {
    case 'LOADED_NOTIFICATIONS':
      let list = action.list.map(fromParseObject);
      return {...state, server: list};

    case 'TURNED_ON_PUSH_NOTIFICATIONS':
      return { ...state, enabled: true };

    case 'SKIPPED_PUSH_NOTIFICATIONS':
      return { ...state, enabled: false };

    case 'REGISTERED_PUSH_NOTIFICATIONS':
      return { ...state, registered: true };

    case 'RESET_NUXES':
      return { ...state, enabled: initialState.enabled };

    case 'CHECK_PUSH_NOTIFICATIONS':
      return { ...state, disabled: action.disabled }

    default:
      return state;
  }
}

const fromParseObject = object => {
  return {
    id: object.id,
    text: object.get('text'),
    url: object.get('url'),
    time: object.createdAt.getTime(),
  }
}