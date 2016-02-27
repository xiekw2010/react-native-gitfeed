@import Foundation;


/**
 *  Web资源拦截器接口定义
 */
@protocol GFWebResourceInterceptorSettings <NSObject>
@required

/**
 *  配置版本，默认配置版本为`0`。
 *  当更新拦截器配置时候，检查之前配置版本与传入配置的版本是否一样，
 *  如果配置版本一样或者传入配置版本小于已生效的配置版本，则丢弃传入配置。
 *
 *  @discussion
 *  如果配置已变更，采用数字自增方式管理配置版本。
 */
@property (nonatomic, assign) NSInteger version;

/**
 *  控制是否开启Web资源拦截功能，`YES`为开启，`NO`为关闭。默认实现为开启。
 */
@property (nonatomic, assign) BOOL enabled;

/**
 *  Web资源拦截支持的后缀名。目前支持`js`和`css`。
 */
@property (nonatomic, strong) NSString *extensions;

/**
 *  Web资源拦截域白名单。
 *  检查当前请求关联的`Host`和`Referer`是否在白名单内，
 *  如果不在白名单内，则不会触发资源拦截。
 */
@property (nonatomic, strong) NSArray *whitelist;

/**
 *  Web资源拦截黑名单。
 *  检查当前请求关联的`Host`和`Referer`是否在黑名单内，
 *  如果在黑名单内，则不会触发资源拦截。
 */
@property (nonatomic, strong) NSArray *blacklist;

/**
 *  cache的自动清理时间，默认3天 24 * 60 * 60 * 3
 */
@property (nonatomic, assign) NSUInteger cacheMaxAge;

@end

/**
 *  Web资源拦截配置默认实现类。
 */
@interface GFWebResourceInterceptorSettings : NSObject <GFWebResourceInterceptorSettings>

@end