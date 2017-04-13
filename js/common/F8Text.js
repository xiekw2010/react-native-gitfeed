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
 * @providesModule F8Text
 * @flow
 */

'use strict';

import React from 'react'
import ReactNative, { StyleSheet, Dimensions } from 'react-native'
import Colors from '../constants/Colors'

export function Text({ style, ...props }: Object):ReactElement {
  return <ReactNative.Text style={[styles.font, style ]} {...props} />;
}

export function Heading1({ style, ...props }: Object):ReactElement {
  return <ReactNative.Text
    style={[styles.font, styles.h1, style]} {...props} />;
}

export function Heading2({ style, ...props }: Object):ReactElement {
  return <ReactNative.Text
    style={[styles.font, styles.h2, style]} {...props} />;
}

export function Paragraph({ style, ...props }: Object):ReactElement {
  return <ReactNative.Text style={[styles.font, styles.p, style]} {...props} />;
}

export function LinkText({ style, ...props }: Object):ReactElement {
  return <NormalText
    style={[styles.font, { color: Colors.textLink, }, style]} {...props} />;
}

export function NormalText({ style, ...props }: Object):ReactElement {
  return <ReactNative.Text
    style={[styles.font, styles.normal, style]} {...props} />;
}


const scale = Dimensions.get('window').width / 375;

function normalize(size:number):number {
  return Math.round(scale * size);
}

const styles = StyleSheet.create({
  font: {
    fontFamily: require('../env').fontFamily,
  },
  h1: {
    fontSize: normalize(24),
    lineHeight: normalize(27),
    color: Colors.textDark,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  h2: {
    fontSize: normalize(15),
    lineHeight: normalize(20),
    color: Colors.textDark,
    fontWeight: 'bold',
  },
  p: {
    fontSize: normalize(15),
    lineHeight: normalize(23),
    color: Colors.textLight,
  },
  normal: {
    fontSize: normalize(14),
    fontWeight: 'normal',
    color: Colors.textDark,
  }
});
