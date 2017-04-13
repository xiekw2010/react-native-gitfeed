# Github Feed
---
Yet another Github client written in react-native.

## Includes ?
---

1. Feed like web github home.
2. Watched repos' notification.
3. Trends.
4. Personal.

## How to run iOS

`rm -rf node_modules`

`npm install`

if error about 'EACCS' try

`sudo chown -R $(whoami) "$HOME/.npm"`

run the project in ios dir

(***注意*** 如果要contribute cocoapods 建议使用0.35.0版本！)

in iOS dir

`pod install`

###接入流程

1. 在index.ios.js(index.android.js)里写入Production的 deploymentKey，通常在componentDidMount里写入如下：

```js
const codePush = require('react-native-code-push');

codePush.sync({
  updateDialog: true,
  installMode: codePush.InstallMode.IMMEDIATE,
  deploymentKey: dpkey,
});
```
2. 修改xcode的edit schema 使得build app是 release模式的，在appDelegate里写入：
```js
NSURL *jsCodeLocation;

#ifdef DEBUG
jsCodeLocation = [NSURL URLWithString:@"http://30.10.111.158:8081/index.ios.bundle?platform=ios&dev=true"];

jsCodeLocation = [NSURL URLWithString:[NSString stringWithFormat:@"http://localhost:8081/index.ios.bundle?platform=ios&dev=true"]];

#else
jsCodeLocation = [CodePush bundleURL];
#endif
```
3. 随意乱改js文件
4. 打包 所有js文件在一个其他位置，可以使用`打包需要更新的资源`
5. 用code-push发布。

## CodePush

注意在打包的目标地址先建立对应的目录比如这里的~/Desktop/release，要现在Desktop建立好。

打包到桌面本地资源(包括图片)：
react-native bundle --platform ios --entry-file index.ios.js --bundle-output ./ios/main.jsbundle --dev false

查看更新状态：
code-push deployment ls GitFeed-iOS

发布更新：
code-push release GitFeed-iOS ~/Desktop/release 1.0.0 -d Production
