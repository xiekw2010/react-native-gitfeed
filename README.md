# Github Feed

Yet another Github client written with react-native.

![](http://ww2.sinaimg.cn/large/84178573gw1f1387u08s5j20x60bsdiz.jpg)

## Includes ?

1. Feeds like web github home.
2. Search users or repos.
3. Star, watch repos, follow guys.
3. Explore trending repos daily, weekly, monthly.
4. Check who's famous in some filed all of the world.

## online apps

iOS:

![](http://img3.tbcdn.cn/L1/461/1/b77fe7c74ef98edde9ff366416fb5597bd8eb88c.png)

android:

![](http://img3.tbcdn.cn/L1/461/1/d395f6d2148b392550b971ce7f50672b04fd1716.png)

## How to build this

###register(If you don't need login, this is optional)

1. You must have a github client key and secret, check [this](https://github.com/settings/applications/new) out!

2. change `config.js`

Filling your github client and key

###Install JS env

`npm install`

if error about 'EACCS' try

`sudo chown -R $(whoami) "$HOME/.npm"`

##iOS

open the project in ios dir `cd ios`

`pod install`

### release模式

1. edit xcode project `RN_CNNode`'s scheme to `release` mode

![screenshot](http://img3.tbcdn.cn/L1/461/1/bc8dcf0ba852141503e99a408d08ab44e33d9e41.png)

2. bundle the JS resources, in project root dir

  ```sh
  react-native bundle --platform ios --entry-file index.ios.js --bundle-output ./release/main.jsbundle --assets-dest ./release --dev false
  ```

3. xcode run!

### debug模式

Edit xcode project `RN_CNNode` edit scheme to `debug` mode

Xcode run!

##android

### release模式
Open android studio，change the `Build Variants` to `release`

`sh ./build_android.sh`

### debug模式

`react-native run-android`

Emulator run some device.

## [Code-push](http://microsoft.github.io/code-push/) practice (optional knowledge)

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

##Let's talk about it(So far Chinese supported)  

[一次RN跨平台开发之旅](http://xiekw2010.github.io/2016/02/11/rngitfeed)

###License
Check out the GPL license file.
