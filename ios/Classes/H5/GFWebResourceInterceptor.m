#import "GFWebResourceInterceptor.h"
#import "GFWebResourceURLProtocol.h"
#import "GFWebResourceCache.h"

static GFWebResourceInterceptor *gWebResourceInterceptor = nil;

@interface GFWebResourceInterceptor ()

@property (nonatomic, strong) id<GFWebResourceInterceptorSettings> settings;
@property (nonatomic, strong) GFWebResourceCache *cache;

// external did update interceptor settings
@property (atomic, assign) BOOL didUpdateInceptorSettings;

@end

@implementation GFWebResourceInterceptor {
@private
  struct {
    unsigned int didRegisterURLProtocol:1; // did register custom url protocol
  }_interceptorFlags;
}

- (id)init {
  self = [super init];
  if (self) {
    [self commonInit];
  }
  
  return self;
}

+ (instancetype)globalWebResourceInterceptor {
  @synchronized([self class]) {
    if (gWebResourceInterceptor == nil) {
      gWebResourceInterceptor = [[GFWebResourceInterceptor alloc] init];
    }
  }
  
  return gWebResourceInterceptor;
}

+ (void)setGlobalWebResourceInterceptor:(GFWebResourceInterceptor *)interceptor {
  @synchronized([self class]) {
    if (gWebResourceInterceptor != interceptor) {
      gWebResourceInterceptor = interceptor;
    }
  }
}


//////////////////////////////////////////////////////////////////////////////////

#pragma mark -
#pragma mark private methods

- (void)commonInit {
  // update flags
  _interceptorFlags.didRegisterURLProtocol = 0;
  self.didUpdateInceptorSettings = NO;
  
  // create web cache
  _cache = [[GFWebResourceCache alloc] init];
}

- (void)registerWebResourceInterceptorURLProtocol {
  if (_settings.enabled
      && !_interceptorFlags.didRegisterURLProtocol) {
    _interceptorFlags.didRegisterURLProtocol = 1; // update flags
    
    // register url protocol handle class
    [NSURLProtocol registerClass:[GFWebResourceURLProtocol class]];
  }
}

- (void)unregisterWebResourceInterceptorURLProtocol {
  if (_interceptorFlags.didRegisterURLProtocol) {
    _interceptorFlags.didRegisterURLProtocol = 0; // update flags
    
    // unregister url protocol handle class
    [NSURLProtocol unregisterClass:[GFWebResourceURLProtocol class]];
  }
}

- (void)notifyDidChangeInterceptorSettings {
  if (_settings != nil && _settings.enabled) {
    // open web resource interceptor
    [self registerWebResourceInterceptorURLProtocol];
    
  } else {
    // close web resource interceptor
    [self unregisterWebResourceInterceptorURLProtocol];
  }
}


//////////////////////////////////////////////////////////////////////////////////

#pragma mark -
#pragma mark public methods

- (void)setupDefaultWebResourceInterceptorSettings {
  id<GFWebResourceInterceptorSettings> settings =
  [GFWebResourceInterceptorSettings defaultInterceptorSettings];
  
  // update with default interceptor settings
  [self updateInterceptorSettings:settings isDefaultSettings:YES];
}

// NOTICE: Not thread safety
- (BOOL)isWhitelistHost:(NSString *)host {
  if (host == nil || [host length] == 0) return NO;
  
  BOOL isValid = NO;
  
  // for performance issue, not synchronized thread to do whitelist checking.
  NSArray *whitelist = _settings.whitelist;
  if (whitelist != nil) {
    for (NSString *domain in whitelist) {
      // check the domain or sub domain has same suffix
      if (NSNotFound != [host rangeOfString:domain].location) {
        isValid = YES;
        
        break;
      }
    }
  }
  
  return isValid;
}

// NOTICE: Not thread safety
- (BOOL)isBlacklistWithRequestPath:(NSString *)path {
  if (path == nil || [path length] == 0) return NO;
  
  BOOL exists = NO;
  
  // for performance issue, not synchronized thread to do blacklist checking.
  NSArray *blacklist = _settings.blacklist;
  if (blacklist != nil) {
    for (NSString *domain in blacklist) {
      // check the domain or sub domain has same suffix
      if (NSNotFound != [path rangeOfString:domain].location) {
        exists = YES;
        
        break;
      }
    }
  }
  
  return exists;
}

- (void)clearAgeCache {
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSString *cachePath = self.cache.cachePath;
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSURL *diskCacheURL = [NSURL fileURLWithPath:cachePath isDirectory:YES];
    NSArray *resourceKeys = @[NSURLIsDirectoryKey, NSURLContentModificationDateKey, NSURLTotalFileAllocatedSizeKey];
    
    // This enumerator prefetches useful properties for our cache files.
    NSDirectoryEnumerator *fileEnumerator = [fileManager enumeratorAtURL:diskCacheURL
                                              includingPropertiesForKeys:resourceKeys
                                                                 options:NSDirectoryEnumerationSkipsHiddenFiles
                                                            errorHandler:NULL];
    
    NSDate *expirationDate = [NSDate dateWithTimeIntervalSinceNow:-self.settings.cacheMaxAge];
    NSMutableDictionary *cacheFiles = [NSMutableDictionary dictionary];
    NSUInteger currentCacheSize = 0;
    
    // Enumerate all of the files in the cache directory.  This loop has two purposes:
    //
    //  1. Removing files that are older than the expiration date.
    //  2. Storing file attributes for the size-based cleanup pass.
    NSMutableArray *urlsToDelete = [[NSMutableArray alloc] init];
    for (NSURL *fileURL in fileEnumerator) {
      NSDictionary *resourceValues = [fileURL resourceValuesForKeys:resourceKeys error:NULL];
      
      // Skip directories.
      if ([resourceValues[NSURLIsDirectoryKey] boolValue]) {
        continue;
      }
      
      // Remove files that are older than the expiration date;
      NSDate *modificationDate = resourceValues[NSURLContentModificationDateKey];
      if ([[modificationDate laterDate:expirationDate] isEqualToDate:expirationDate]) {
        [urlsToDelete addObject:fileURL];
        continue;
      }
      
      // Store a reference to this file and account for its total size.
      NSNumber *totalAllocatedSize = resourceValues[NSURLTotalFileAllocatedSizeKey];
      currentCacheSize += [totalAllocatedSize unsignedIntegerValue];
      [cacheFiles setObject:resourceValues forKey:fileURL];
    }
    
    for (NSURL *fileURL in urlsToDelete) {
      [fileManager removeItemAtURL:fileURL error:nil];
    }
  });
}

// NOTICE: Not thread safety
- (BOOL)isSupportedPathExtension:(NSString *)extension {
  if (extension == nil || [extension length] == 0) return NO;
  
  BOOL isSupported = NO;
  if (_settings.extensions
      && [_settings.extensions rangeOfString:extension].location != NSNotFound) {
    
    isSupported = YES;
  }
  
  return isSupported;
}

- (void)updateInterceptorSettings:(id<GFWebResourceInterceptorSettings>)settings {
  [self updateInterceptorSettings:settings isDefaultSettings:NO];
}

- (void)updateInterceptorSettings:(id<GFWebResourceInterceptorSettings>)settings
                isDefaultSettings:(BOOL)isDefaultSettings {
  
  // update flags
  if (!isDefaultSettings && !self.didUpdateInceptorSettings) {
    self.didUpdateInceptorSettings = YES;
  }
  
  @synchronized(self) {
    _settings = settings; // update interceptor settings
  }
  
  // notify did change interceptor settings
  [self notifyDidChangeInterceptorSettings];
  
  // clear cache
  [self clearAgeCache];
}

@end
