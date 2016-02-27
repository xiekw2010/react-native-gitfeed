//
//  GFDiskCacheManager.m
//  RN_CNNode
//
//  Created by xiekw on 16/1/19.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "GFDiskCacheManager.h"
#import "RCTBridge.h"
#import "RCTConvert.h"
#import "GFWebResourceInterceptor.h"
#import "GFWebResourceCache.h"
#import "DXFileManager.h"

@implementation GFDiskCacheManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(diskCacheCost:(RCTResponseSenderBlock)callback) {
  [[GFWebResourceInterceptor globalWebResourceInterceptor].cache cacheCost:^(NSUInteger fileSize) {
    callback(@[@(fileSize)]);
  }];
}

RCT_EXPORT_METHOD(clearDiskCache:(RCTResponseSenderBlock)callback) {
  [[GFWebResourceInterceptor globalWebResourceInterceptor].cache clearCache:^(NSUInteger fileSize) {
    callback(@[@(fileSize)]);
  }];
}

@end
