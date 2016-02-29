# Github Feed

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)


Yet another Github client written with react-native.

![](http://ww2.sinaimg.cn/large/84178573gw1f1387u08s5j20x60bsdiz.jpg)

## Includes ?

1. Feeds like web github home.
2. Search users or repos.
3. Star, watch repos, follow guys.
3. Explore trending repos daily, weekly, monthly.
4. Check who's famous in some filed all of the world.

## Online apps

iOS:

![](http://img3.tbcdn.cn/L1/461/1/b77fe7c74ef98edde9ff366416fb5597bd8eb88c.png)

android:

![2016_02_29_2007551457](http://img4.tbcdn.cn/L1/461/1/c789a340011d4c427ab6660148753faa0b075501.png)

## How to build this

###Register(If you don't need login, skip this step)

1. You a github client key and secret, check [this](https://github.com/settings/applications/new) out!

2. change `config.js`

Filling your github client and key

###Install JS env

`npm install`

if error about 'EACCS' try

`sudo chown -R $(whoami) "$HOME/.npm"`

##iOS

open the project in ios dir `cd ios`

`pod install`

### Release mode

1. edit xcode project `RN_CNNode`'s scheme to `release` mode

![screenshot](http://img3.tbcdn.cn/L1/461/1/bc8dcf0ba852141503e99a408d08ab44e33d9e41.png)

2. bundle the JS resources, in project root dir

  ```sh
  react-native bundle --platform ios --entry-file index.ios.js --bundle-output ./release/main.jsbundle --assets-dest ./release --dev false
  ```

3. xcode run!

### Debug mode

Edit xcode project `RN_CNNode` edit scheme to `debug` mode

Xcode run!

##Android

Use Android studio to open the `android` dir, the studio will take a lot time to build the project(just be patient).

### Release mode

Connect your devices with USB.

Open Android studio，change the `Build Variants` to `release`

#### Device
`sh ./build_android.sh`

#### Emulator

Just run the project

### Debug mode

`react-native run-android`

Emulator run some device.

## [Code-push](http://microsoft.github.io/code-push/) practice (This step is optional)

1. mkdir ~/Desktop/release
2. bundle the js resources

```js
// including image resources
react-native bundle --platform ios --entry-file index.ios.js --bundle-output ~/Desktop/release/main.jsbundle --assets-dest ~/Desktop/release --dev false

// not including image resources
react-native bundle --platform ios --entry-file index.ios.js --bundle-output ~/Desktop/release/main.jsbundle --dev false
```

Check app status

	code-push deployment ls GitFeed-iOS

Publish update

	code-push release GitFeed-iOS ~/Desktop/release 1.0.0 -d Production

##Let's talk about it(So far only Chinese supported)  

[一次RN跨平台开发之旅](http://xiekw2010.github.io/2016/02/11/rngitfeed)

###License
GPL. Copyright (c) [David Tse](https://github.com/xiekw2010).
