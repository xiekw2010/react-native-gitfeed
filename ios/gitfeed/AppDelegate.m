/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import "CodePush.h"
#import "MobClick.h"
#import "RCTRootView.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  UMConfigInstance.appKey = @"56a8db12e0f55a3cd40005f2";
  [MobClick startWithConfigure:UMConfigInstance];
  
  NSURLCache *urlCache = [[NSURLCache alloc] initWithMemoryCapacity:20 * 1024 * 1024 diskCapacity:100 * 1024 * 1024 diskPath:nil];
  [NSURLCache setSharedURLCache:urlCache];
  
  NSURL *jsCodeLocation;
  
#ifdef DEBUG
  jsCodeLocation = [NSURL URLWithString:[NSString stringWithFormat:@"http://localhost:8081/index.ios.bundle?platform=ios&dev=true"]];
#else
    jsCodeLocation = [CodePush bundleURL];
#endif

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"gitfeed"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

@end
