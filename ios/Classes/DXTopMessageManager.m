//
//  DXTopMessageManager.m
//  RN_CNNode
//
//  Created by xiekw on 15/10/21.
//  Copyright © 2015年 Facebook. All rights reserved.
//

#import "DXTopMessageManager.h"
#import "RCTBridge.h"
#import "RCTConvert.h"
#import "RCTScrollView.h"
#import "RCTUIManager.h"
#import "RCTEventDispatcher.h"
#import "UIView+react.h"
#import "UIView+TopBarMessage.h"

@implementation DXTopMessageManager

@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue {
  return _bridge.uiManager.methodQueue;
}

RCT_EXPORT_MODULE();

/**
 *  Show top message
 *
 *  @param config {
 *     background: '#111111',
 *     textColor: '#111111',
 *     font: {'fontFamily': 'hev', 'fontSize': 12, 'fontWeight': 11, 'fontStyle': 'bold'},
 *     icon: 'imagename',
 *     offset: 64,
 *  }
 *
 */

RCT_EXPORT_METHOD(showTopMessage:(nonnull NSNumber *)reactTag message:(nonnull NSString *)message config:(NSDictionary *)config callback:(RCTResponseSenderBlock)callback) {
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
    dispatch_async(dispatch_get_main_queue(), ^{
      UIView *view = viewRegistry[reactTag];
      if (!view) {
        NSLog(@"Cannot find view with tag #%@", reactTag);
        return;
      }
      
      [view showTopMessage:message topBarConfig:[self mapTopBarConfig:config] dismissDelay:3.0 withTapBlock:^{
        [_bridge.eventDispatcher sendDeviceEventWithName:@"messageTapped" body:reactTag];
      }];
      
      callback(@[[NSNull null], reactTag]);
    });
  }];
  
}

- (NSDictionary *)mapTopBarConfig:(NSDictionary *)jsConfig {
  NSMutableDictionary *mdic = [NSMutableDictionary dictionaryWithCapacity:jsConfig.count];
  id backColor = jsConfig[@"background"];
  if (backColor) {
    mdic[kDXTopBarBackgroundColor] = [RCTConvert UIColor:backColor];
  }
  
  id textColor = jsConfig[@"textColor"];
  if (textColor) {
    mdic[kDXTopBarTextColor] = [RCTConvert UIColor:textColor];
  }
  
  id font = jsConfig[@"font"];
  if (font) {
    mdic[kDXTopBarTextFont] = [RCTConvert UIFont:font];
  }
  
  id offset = jsConfig[@"offset"];
  mdic[kDXTopBarOffset] = @([offset floatValue]);
  
  return mdic;
}

@end
