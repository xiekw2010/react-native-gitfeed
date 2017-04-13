/**
 * Created by xiekaiwei on 16/8/24.
 */

import { NativeModules } from 'react-native'
const ShareCenter = NativeModules.MEShareCenter

/**
 *
 * @param uri Image URI
 * @param scene
 */
//enum WXScene {
//  WXSceneSession  = 0,        /**< 聊天界面    */
//    WXSceneTimeline = 1,        /**< 朋友圈      */
//    WXSceneFavorite = 2,        /**< 收藏       */
//};
exports.shareWXImage = ShareCenter.shareWXImage
exports.shareWebLink = ShareCenter.shareWebLink
