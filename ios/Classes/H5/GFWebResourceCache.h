@import Foundation;

/**
 *  Web资源缓存管理类
 */
@interface GFWebResourceCache : NSObject

@property (nonatomic, strong, readonly) NSString *cachePath;

/**
 *  检查是否有命中的缓存索引，用于提升检索效率，减少IO操作。
 *
 *  @param key 缓存对应唯一的key
 *
 *  @return 返回`YES`标示本地存在对应的缓存，反之则`NO`
 */
- (BOOL)hasCacheForKey:(NSString *)key;

/**
 *  通过传入的key创建缓存检索索引。
 *
 *  @param key 缓存对应唯一的key
 */
- (void)addCacheIndexForKey:(NSString *)key;

/**
 *  移除该key关联的缓存检索索引。
 *
 *  @param key 缓存对应唯一的key
 */
- (void)removeCacheIndexForKey:(NSString *)key;

/**
 *  清除cache的index table和cache file
 *
 */
- (void)clearCache:(void (^)(NSUInteger fileSize))completionBlock;

/**
 *  查看cache了多少大小
 *
 */
- (void)cacheCost:(void (^)(NSUInteger fileSize))completionBlock;

/**
 *  通过缓存key获取关联的数据。
 *
 *  @param key      缓存对应唯一的key
 *  @param url      请求URL
 *  @param response 响应头
 *
 *  @return 返回本地缓存的数据，如果返回为`nil`，则需要手工移除该key关联的缓存索引
 */
- (NSData *)cacheDataForKey:(NSString *)key url:(NSURL *)url response:(NSURLResponse **)response;

/**
 *  通过关联的key存储缓存数据
 *
 *  @param data            数据
 *  @param response        响应头
 *  @param key             缓存对应唯一的key
 *  @param completionBlock 完成回调
 */
- (void)storeCacheData:(NSData *)data
              response:(NSURLResponse *)response
                forKey:(NSString *)key
       completionBlock:(void (^)(BOOL succeed))completionBlock;


@end
