#import <MobileCoreServices/MobileCoreServices.h>
#import "GFWebResourceCache.h"

@interface GFWebResourceCache ()

@property (nonatomic, strong) NSString *cachePath;
@property (atomic, assign) BOOL buildingIndexTable;
@property (nonatomic, strong) NSMutableDictionary *indexTable;
@property (nonatomic, strong) NSRecursiveLock *lock;

@end

@implementation GFWebResourceCache

- (id)init {
  self = [super init];
  if (self) {
    [self commonInit];
  }
  
  return self;
}


//////////////////////////////////////////////////////////////////////////////////

#pragma mark -
#pragma mark private methods

- (NSString *)webCachePath {
  static NSString *cachesPath = nil;
  if (nil == cachesPath) {
    NSArray *dirs = NSSearchPathForDirectoriesInDomains(NSCachesDirectory,
                                                        NSUserDomainMask,
                                                        YES);
    cachesPath = ([dirs count] > 0) ? dirs[0] : nil;
    cachesPath = [cachesPath stringByAppendingPathComponent:@"InterceptedResources"];
  }
  
  return cachesPath;
}

- (void)commonInit {
  _cachePath = [self webCachePath];
  
  _buildingIndexTable = NO;
  _indexTable = [[NSMutableDictionary alloc] init];
  _lock = [[NSRecursiveLock alloc] init];
  
  // create cache folder if needs
  [self createCacheDirectory];
  
  // start lazy to build cache index table
  [self buildCacheIndexTable];
}

- (BOOL)createCacheDirectory {
  BOOL succeed = YES;
  BOOL shouldCreate = NO;
  
  BOOL isDir = NO;
  NSError *error = nil;
  NSFileManager *fm = [NSFileManager defaultManager];
  if ([fm fileExistsAtPath:_cachePath isDirectory:&isDir]) {
    // the cache directory and it's can not be a file
    if (!isDir) {
      succeed = NO;
      if ([fm removeItemAtPath:_cachePath error:&error]) { // remove it
        shouldCreate = YES;
        
      } else {
        NSLog(@"remove placeholder file:%@ did failed:%@", _cachePath, error);
      }
    }
    
  } else {
    succeed = NO;
    shouldCreate = YES;
  }
  
  if (shouldCreate) {
    succeed = [fm createDirectoryAtPath:_cachePath
            withIntermediateDirectories:YES
                             attributes:nil
                                  error:&error];
    if (error != nil) {
      NSLog(@"create cache directory:%@ occur an error:%@", _cachePath, error);
    }
  }
  
  return succeed;
}

- (void)buildCacheIndexTable {
  if (self.buildingIndexTable) return; // build index table is going now, can not be continue
  self.buildingIndexTable = YES;
  
  dispatch_block_t blockImpl = ^(void) {
    NSArray *contents = [self listAllCacheItemsAtPath:_cachePath];
    if (contents != nil && [contents count] > 0) {
      // lock
      [_lock lock];
      
      for (NSString *item in contents) {
        _indexTable[item] = @(YES);
      }
      
      // unlock
      [_lock unlock];
    }
    
    self.buildingIndexTable = NO; // update flags
  };
  
  // build cache index table on main thread
  if ([NSThread isMainThread]) {
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), blockImpl);
    
  } else {
    blockImpl();
  }
}

- (NSArray *)listAllCacheItemsAtPath:(NSString *)path {
  NSFileManager *fm = [[NSFileManager alloc] init];
  
  BOOL isDir = NO;
  
  // the cache path is not exists
  if (![fm fileExistsAtPath:path isDirectory:&isDir]) return nil;
  
  // the cache path is not a directory
  if (!isDir) return nil;
  
  NSArray *contents = nil;
  for (NSUInteger idx = 0; idx < 3; idx++) { // max allowed retry 3 times when error occurs
    NSError *error = nil;
    contents = [fm contentsOfDirectoryAtPath:path error:&error];
    if (error == nil) {
      break;
    }
  }
  
  return contents;
}

- (NSString *)responseHeaderPathWithKey:(NSString *)key {
  // build header path
  NSString *headerName = [key stringByAppendingString:@".header"];
  NSString *path = [_cachePath stringByAppendingPathComponent:headerName];
  
  return path;
}


//////////////////////////////////////////////////////////////////////////////////

#pragma mark -
#pragma mark public methods

- (BOOL)hasCacheForKey:(NSString *)key {
  if (key == nil || [key length] == 0) return NO;
  
  BOOL exists = NO;
  if (self.buildingIndexTable) {
    // build cache index table works on sub thread,
    // so use IO to check local cache is available
    NSString *path = [_cachePath stringByAppendingPathComponent:key];
    if ([[NSFileManager defaultManager] fileExistsAtPath:path]) {
      exists = YES;
    }
    
  } else {
    // lock
    [_lock lock];
    
    if (_indexTable[key] != nil) exists = YES;
    
    // unlock
    [_lock unlock];
  }
  
  return exists;
}

- (void)addCacheIndexForKey:(NSString *)key {
  if (key == nil || [key length] == 0) return;
  
  // lock
  [_lock lock];
  
  _indexTable[key] = @(YES);
  
  // unlock
  [_lock unlock];
}

- (void)removeCacheIndexForKey:(NSString *)key {
  if (key == nil || [key length] == 0) return;
  
  // lock
  [_lock lock];
  
  [_indexTable removeObjectForKey:key];
  
  // unlock
  [_lock unlock];
}

+ (uint64_t)totalSizeOfItemAtPath:(NSString *)path recursively:(BOOL)recursive
{
  NSFileManager *fileManager = [NSFileManager defaultManager];
  NSDictionary *attributes = [fileManager attributesOfItemAtPath:path error:NULL];
  uint64_t totalSize = [attributes fileSize];
  
  if (!recursive) {
    return totalSize;
  }
  
  for (NSString *fileName in [fileManager enumeratorAtPath:path]) {
    attributes = [fileManager attributesOfItemAtPath:[path stringByAppendingPathComponent:fileName] error:NULL];
    totalSize += [attributes fileSize];
  }
  
  return totalSize;
}

- (void)cacheCost:(void (^)(NSUInteger))completionBlock {
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSUInteger totalSize = [[self class] totalSizeOfItemAtPath:_cachePath recursively:YES];
    
    completionBlock(totalSize);
  });
}

- (void)clearCache:(void (^)(NSUInteger fileSize))completionBlock {
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    if ([[NSFileManager defaultManager] fileExistsAtPath:_cachePath]) {
      NSError *error = nil;
      NSUInteger totalSize = [[self class] totalSizeOfItemAtPath:_cachePath recursively:YES];
      if ([[NSFileManager defaultManager] removeItemAtPath:_cachePath error:&error]) {
        // lock
        [_lock lock];
        
        [_indexTable removeAllObjects];
        
        // unlocks
        [_lock unlock];
        
        NSLog(@"success to remove cache file on path %@", _cachePath);
      }
      
      // print verbose
      if (error != nil) NSLog(@"%@", [error localizedDescription]);
      
      completionBlock(totalSize);
      
    } else {
      NSLog(@"cache file not exist on path %@", _cachePath);
      completionBlock(0);
    }
  });
}

- (NSData *)cacheDataForKey:(NSString *)key url:(NSURL *)url response:(NSURLResponse **)response {
  if (key == nil || [key length] == 0) return nil;
  
  NSString *path = [_cachePath stringByAppendingPathComponent:key];
  NSData *data = [NSData dataWithContentsOfFile:path];
  
  if (response != NULL) {
    // custom header fields
    NSMutableDictionary *customFields = [NSMutableDictionary dictionaryWithCapacity:2];
    
    // retrieve content type from local disk
    NSString *headerPath = [self responseHeaderPathWithKey:key];
    NSString *contentType = [NSString stringWithContentsOfFile:headerPath
                                                      encoding:NSUTF8StringEncoding
                                                         error:NULL];
    
    if (contentType == nil) {
      // try to match content type from extension from file
      NSString *extension = [key pathExtension];
      contentType = [GFWebResourceCache mimeTypeBaseOnExtension:extension];
    }
    
    if (contentType != nil) {
      customFields[@"Content-Type"] = contentType;
    }
    
    // content length
    customFields[@"Content-Length"] = [NSString stringWithFormat:@"%ld", (unsigned long)[data length]];
    
    *response = [[NSHTTPURLResponse alloc] initWithURL:url
                                            statusCode:200
                                           HTTPVersion:@"HTTP/1.1"
                                          headerFields:customFields];
  }
  
  if (data == nil) {
    // invalid cache index
    [self removeCacheIndexForKey:key];
  }
  
  return data;
}

- (void)storeCacheData:(NSData *)data
              response:(NSURLResponse *)response
                forKey:(NSString *)key
       completionBlock:(void (^)(BOOL succeed))completionBlock {
  
  if (data == nil || key == nil) return;
  
  // make sure write file on sub thread,
  // if current context is on main thread then store cache file will works on sub thread.
  // if current context is sub thread then store cache file works on it.
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSString *path = [_cachePath stringByAppendingPathComponent:key];
    
    BOOL succeed = NO;
    NSFileManager *fm = [[NSFileManager alloc] init];
    
    // use loop to store cache data to make sure have a chance to try again
    // when the parent cache directory did missed.
    for (NSUInteger idx = 0; idx < 2; idx++) {
      // create new cache file or override exists one
      if ([fm createFileAtPath:path contents:data attributes:nil]) {
        succeed = YES;
      }
      
      // check save response if needs
      if (succeed && [response isKindOfClass:[NSHTTPURLResponse class]]) {
        NSDictionary *headers = [(NSHTTPURLResponse *)response allHeaderFields];
        if (headers != nil && [headers count] > 0) {
          // for now, we just care about 'Content-Type' header field,
          // to improve IO performance then just save 'Content-Type' to local disk.
          NSString *contentType = headers[@"Content-Type"];
          if (contentType != nil && [contentType length] > 0) {
            // store 'Content-Type' headers
            NSString *headerPath = [self responseHeaderPathWithKey:key];
            [contentType writeToFile:headerPath
                          atomically:NO
                            encoding:NSUTF8StringEncoding
                               error:NULL];
          }
        }
      }
      
      if (succeed) {
        break; // not needs to retry.
        
      } else {
        // if the intermediate folder did missed also cause store cache data fails.
        // so try to create cache folder if needs and try again.
        if (![self createCacheDirectory]) {
          // the parent cache directory not exists and create it did fail,
          // can not be continue,
          break;
        }
      }
    }
    
    if (succeed) {
      // update cache index table
      [self addCacheIndexForKey:key];
    }
    
    // callback on completion
    if (completionBlock != nil) {
      completionBlock(succeed);
    }
  });
}


//////////////////////////////////////////////////////////////////////////////////

#pragma mark -
#pragma mark Utility methods

+ (NSString *)mimeTypeBaseOnExtension:(NSString *)extension {
  NSString *defaultMIMEType = @"application/octet-stream";
  if (extension == nil || [extension length] == 0) {
    return defaultMIMEType;
  }
  
  NSString *mimeType = nil;
  CFStringRef UTI = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension,
                                                          (__bridge CFStringRef)extension,
                                                          NULL);
  
  if (UTI != NULL) {
    mimeType = (__bridge_transfer NSString *)(UTTypeCopyPreferredTagWithClass(UTI, kUTTagClassMIMEType));
    
    CFRelease(UTI); // dispose UTI
  }
  
  // use default MIME type
  if (mimeType == nil) mimeType = defaultMIMEType;
  
  return mimeType;
}

@end
