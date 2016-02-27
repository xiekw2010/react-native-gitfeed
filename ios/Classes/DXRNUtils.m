//
//  DXRNUtils.m
//  RN_CNNode
//
//  Created by xiekw on 15/11/18.
//  Copyright © 2015年 Facebook. All rights reserved.
//

#import "DXRNUtils.h"

static NSString * const kAppId = @"1079873993";

@implementation DXRNUtils

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(clearCookies:(RCTResponseSenderBlock)callback) {
  NSHTTPCookieStorage *cookieStore = [NSHTTPCookieStorage sharedHTTPCookieStorage];
  for (NSHTTPCookie *cookie in [cookieStore cookies]) {
    [cookieStore deleteCookie:cookie];
  }
  
  callback(@[[NSNull null]]);
}

RCT_EXPORT_METHOD(trackClick:(nonnull NSString *)eventName attributes:(NSDictionary *)atr) {
}

RCT_EXPORT_METHOD(appInfo:(RCTResponseSenderBlock)callback) {
  NSString *appVersion = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"];
  NSString *appBuild = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleVersion"];
  NSString *appStoreURL = [[NSString alloc] initWithFormat:@"http://phobos.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=%@&mt=8", kAppId];
  NSString *rateURL = [[NSString alloc] initWithFormat:@"itms-apps://ax.itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?type=Purple+Software&id=%@", kAppId];

  callback(@[
             @{@"appVersion": appVersion,
               @"appBuild": appBuild,
               @"appStoreURL": appStoreURL,
               @"rateURL": rateURL
               }
             ]);
}

@end
