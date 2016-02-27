#import "GFWebResourceInterceptorSettings+Internal.h"

@implementation GFWebResourceInterceptorSettings

@synthesize version = _version;
@synthesize enabled = _enabled;
@synthesize extensions = _extensions;
@synthesize whitelist = _whitelist;
@synthesize blacklist = _blacklist;
@synthesize cacheMaxAge = _cacheMaxAge;

+ (instancetype)buildDefaultWebResourceInterceptorSettings {
  GFWebResourceInterceptorSettings *settings = [GFWebResourceInterceptorSettings new];
  settings.version = 0;
  settings.enabled = YES;
  settings.extensions = @"js,css,md";
  settings.whitelist = @[@"github.com"];
  settings.blacklist = @[@"www.google-analytics.com"];
  settings.cacheMaxAge = 24 * 60 * 60 * 3;
  
  return settings;
}

+ (instancetype)defaultInterceptorSettings {
  return [[self class] buildDefaultWebResourceInterceptorSettings];
}

@end
