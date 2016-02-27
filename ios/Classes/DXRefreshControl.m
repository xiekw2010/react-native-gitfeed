//
//  DXRefreshControl.m
//  RN_CNNode
//
//  Created by xiekw on 15/10/20.
//  Copyright © 2015年 Facebook. All rights reserved.
//

#import "DXRefreshControl.h"
#import "RCTBridge.h"
#import "RCTConvert.h"
#import "RCTScrollView.h"
#import "RCTUIManager.h"
#import "RCTEventDispatcher.h"
#import "UIView+react.h"
@implementation DXRefreshControl {
}

@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue {
  return _bridge.uiManager.methodQueue;
}

RCT_EXPORT_MODULE();


/**
 *  config using the custom refresh header and it must be used like UIRefreshControl
 *
 *  @param config {
 *     headerViewClass: 'JHSPullToRefreshControl',
 *     contentViewClass: 'JHSMagicLampPullToRefreshView'
 *     color: '#AA00FF'
 *  }
 *
 */
RCT_EXPORT_METHOD(configureCustom:(nonnull NSNumber *)reactTag headerConfig:(NSDictionary *)config callback:(RCTResponseSenderBlock)callback) {
  Class headerViewClass = NSClassFromString(config[@"headerViewClass"]);
  if (!headerViewClass) {
    NSLog(@"DXRefreshControl can not find refresh header with headerClassName %@", config[@"headerViewClass"]);
    return;
  }

  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
    dispatch_async(dispatch_get_main_queue(), ^{
      UIView *view = viewRegistry[reactTag];
      if (!view) {
        NSLog(@"Cannot find view with tag #%@", reactTag);
        return;
      }
      
      UIScrollView *scrollView = ((RCTScrollView *)view).scrollView;
      NSInteger refreshTag = reactTag.integerValue;
      
      id refreshControl = (Class)[scrollView viewWithTag:refreshTag];
      if (!refreshControl) {
        CGRect f = scrollView.bounds;
        f.origin.y -= f.size.height;
        UIRefreshControl *refreshControl = [[headerViewClass alloc] initWithFrame:f];
        
        id color = config[@"color"];
        if (color) {
          color = [RCTConvert UIColor:color];
          refreshControl.tintColor = color;
        }
        
        [scrollView addSubview:refreshControl];
        refreshControl.tag = refreshTag;
        [refreshControl addTarget:self action:@selector(dropViewDidBeginRefreshing:) forControlEvents:UIControlEventValueChanged];
        callback(@[[NSNull null], reactTag]);
      }
    });
  }];
}

RCT_EXPORT_METHOD(beginRefreshing:(nonnull NSNumber *)reactTag) {
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
    dispatch_async(dispatch_get_main_queue(), ^{
      UIView *view = viewRegistry[reactTag];
      if (!view) {
        RCTLogError(@"Cannot find view with tag #%@", reactTag);
        return;
      }
      
      UIScrollView *scrollView = ((RCTScrollView *)view).scrollView;
      NSLog(@"scrollView contentinset is %@" , NSStringFromUIEdgeInsets(scrollView.contentInset)) ;
      UIRefreshControl *refreshControl = (UIRefreshControl *)[scrollView viewWithTag:reactTag.integerValue];
      CGFloat contentOffsetY = -(CGRectGetHeight(refreshControl.bounds)) - scrollView.contentInset.top;
      [scrollView setContentOffset:CGPointMake(0, contentOffsetY) animated:YES];
      [refreshControl beginRefreshing];
    });
  }];
}

RCT_EXPORT_METHOD(endRefreshing:(nonnull NSNumber *)reactTag) {
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
    dispatch_async(dispatch_get_main_queue(), ^{
      UIView *view = viewRegistry[reactTag];
      if (!view) {
        RCTLogError(@"Cannot find view with tag #%@", reactTag);
        return;
      }
      
      UIScrollView *scrollView = ((RCTScrollView *)view).scrollView;
      UIRefreshControl *refreshControl = (UIRefreshControl *)[scrollView viewWithTag:reactTag.integerValue];
      [refreshControl endRefreshing];
    });
  }];
}

- (void)dropViewDidBeginRefreshing:(UIRefreshControl *)sender {
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"dropViewDidBeginRefreshing"
                                                  body:@(sender.tag)];

}

@end
