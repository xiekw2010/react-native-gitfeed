@import Foundation;
#import "GFWebResourceInterceptorSettings+Internal.h"

@class GFWebResourceCache;

/**
 *  Web资源拦截器实现类
 */
@interface GFWebResourceInterceptor : NSObject

/**
 *  全局共享的Web资源拦截器
 *
 *  @return 返回全局共享的Web资源拦截器
 */
+ (instancetype)globalWebResourceInterceptor;

/**
 *  设置自定义的全局共享Web资源拦截器。当传入`nil`时，则清空全局的Web资源拦截器。
 *
 *  @param interceptor 自定义拦截器或为`nil`
 */
+ (void)setGlobalWebResourceInterceptor:(GFWebResourceInterceptor *)interceptor;

/**
 *  拦截器设置
 */
@property (nonatomic, strong, readonly) id<GFWebResourceInterceptorSettings> settings;

/**
 *  拦截器资源缓存
 */
@property (nonatomic, strong, readonly) GFWebResourceCache *cache;

/**
 *  配置默认Web资源拦截器的设置
 */
- (void)setupDefaultWebResourceInterceptorSettings;

/**
 *  检查传入的主机名是否在白名单内
 *
 *  @param host 主机名
 *
 *  @return 返回`YES`则表示在白名单内，`NO`则表示不在白名单内
 */
- (BOOL)isWhitelistHost:(NSString *)host;

/**
 *  检查传入的资源路径是否在黑名单内
 *
 *  @param path 请求资源路径
 *
 *  @return 返回`YES`则表示在黑名单内，`NO`则表示不在黑名单内
 */
- (BOOL)isBlacklistWithRequestPath:(NSString *)path;

/**
 *  检查是否支持传入的文件后缀名
 *
 *  @param extension 文件后缀名
 *
 *  @return 返回`YES`则表示支持该后缀名，反之则为`NO`
 */
- (BOOL)isSupportedPathExtension:(NSString *)extension;

/**
 *  更新Web资源拦截器设置
 *
 *  @param settings Web资源拦截器设置
 */
- (void)updateInterceptorSettings:(id<GFWebResourceInterceptorSettings>)settings;

@end
