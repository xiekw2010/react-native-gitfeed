//
//  DXFileManager.m
//  DXFileManager
//
//  Created by xiekw on 15/2/10.
//  Copyright (c) 2015年 xiekw. All rights reserved.
//

#import "DXFileManager.h"
#import <sys/xattr.h>
#import <MobileCoreServices/MobileCoreServices.h>

@implementation DXFileManager

+ (NSString *)cachesDirectory
{
    static NSString *path = nil;
    static dispatch_once_t token;
    dispatch_once(&token, ^{
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
        
        path = [paths lastObject];
    });
    return path;
}

+ (NSString *)documentsDirectory
{
    static NSString *path = nil;
    static dispatch_once_t token;
    dispatch_once(&token, ^{
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        path = [paths lastObject];
    });
    return path;
}

+ (NSString *)libraryDirectory
{
    static NSString *path = nil;
    static dispatch_once_t token;
    dispatch_once(&token, ^{
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES);
        path = [paths lastObject];
    });
    return path;
}

+ (NSString *)mainBundleDirectory
{
    return [NSBundle mainBundle].resourcePath;
}

+ (NSString *)temporaryDirectory
{
    static NSString *path = nil;
    static dispatch_once_t token;
    dispatch_once(&token, ^{
        path = NSTemporaryDirectory();
    });
    return path;
}

+(BOOL)createDirectoriesForPath:(NSString *)path error:(NSError **)error
{
    return [[NSFileManager defaultManager] createDirectoryAtPath:path withIntermediateDirectories:YES attributes:nil error:error];
}

+(BOOL)writeFileAtPath:(NSString *)path content:(NSObject *)content
{
    if([content isKindOfClass:[NSMutableArray class]])
    {
       return [((NSMutableArray *)content) writeToFile:path atomically:YES];
    }
    else if([content isKindOfClass:[NSArray class]])
    {
       return [((NSArray *)content) writeToFile:path atomically:YES];
    }
    else if([content isKindOfClass:[NSMutableData class]])
    {
       return [((NSMutableData *)content) writeToFile:path atomically:YES];
    }
    else if([content isKindOfClass:[NSData class]])
    {
        return [((NSData *)content) writeToFile:path atomically:YES];
    }
    else if([content isKindOfClass:[NSMutableDictionary class]])
    {
       return [((NSMutableDictionary *)content) writeToFile:path atomically:YES];
    }
    else if([content isKindOfClass:[NSDictionary class]])
    {
        return [((NSDictionary *)content) writeToFile:path atomically:YES];
    }
    else if([content isKindOfClass:[NSJSONSerialization class]])
    {
       return [((NSDictionary *)content) writeToFile:path atomically:YES];
    }
    else if([content isKindOfClass:[NSMutableString class]])
    {
       return [[((NSString *)content) dataUsingEncoding:NSUTF8StringEncoding] writeToFile:path atomically:YES];
    }
    else if([content isKindOfClass:[NSString class]])
    {
       return [[((NSString *)content) dataUsingEncoding:NSUTF8StringEncoding] writeToFile:path atomically:YES];
    }
    else if([content conformsToProtocol:@protocol(NSCoding)])
    {
      return [NSKeyedArchiver archiveRootObject:content toFile:path];
    }
    else {
        [NSException raise:@"Invalid content type" format:@"content of type %@ is not handled.", NSStringFromClass([content class])];
        
        return NO;
    }
}

+(BOOL)removeItemAtPath:(NSString *)path error:(NSError **)error
{
    return [[NSFileManager defaultManager] removeItemAtPath:path error:error];
}

+(BOOL)removeFilesInDirectoryAtPath:(NSString *)path withExtension:(NSString *)extension
{
    NSPredicate *predicate = [NSPredicate predicateWithBlock:^BOOL(NSString *evaluatedObject, NSDictionary *bindings) {
        NSString *pathExtentsion = [[evaluatedObject pathExtension] lowercaseString];
        NSString *filterExtension = [[extension lowercaseString] stringByReplacingOccurrencesOfString:@"." withString:@""];
        return [pathExtentsion isEqualToString:filterExtension];
    }];
    return [self removeFilesInDirectoryAtPath:path withPredicate:predicate];
}

+(BOOL)removeFilesInDirectoryAtPath:(NSString *)path withPredicate:(NSPredicate *)predicate
{
    NSArray *itemsAtPath = [self listingPathsAtPath:path recursively:NO withPredicate:predicate];
    BOOL suc = YES;
    for (NSString *path in itemsAtPath) {
        suc &= [self removeItemAtPath:path error:NULL];
    }
    return suc;
}

+(BOOL)moveItemAtPath:(NSString *)path toPath:(NSString *)toPath ifCover:(BOOL)cover error:(NSError **)error
{
    NSFileManager *fileManager = [NSFileManager defaultManager];
    BOOL isDirectory;
    if ([fileManager fileExistsAtPath:toPath isDirectory:&isDirectory]) {
        if (!isDirectory && cover) {
            [fileManager removeItemAtPath:toPath error:error];
            return [fileManager moveItemAtPath:path toPath:toPath error:error];
        }
    }
    return [[NSFileManager defaultManager] moveItemAtPath:path toPath:toPath error:error];
}

+ (BOOL)renameItemAtPath:(NSString *)path withName:(NSString *)name error:(NSError **)error
{
    NSString *originPathComponent = [path lastPathComponent];
    NSArray *component = [originPathComponent componentsSeparatedByString:@"."];
    NSString *lastComponent = component.count > 1 ? [component lastObject] : nil;
    originPathComponent = component[0];
    if (lastComponent) {
        originPathComponent = [name stringByAppendingFormat:@".%@", lastComponent];
    }
    
    NSString *newPath = [[path stringByDeletingLastPathComponent] stringByAppendingPathComponent:originPathComponent];
    
    return [self moveItemAtPath:path toPath:newPath ifCover:YES error:error];
}

+(BOOL)copyItemAtPath:(NSString *)path toPath:(NSString *)toPath ifCover:(BOOL)cover error:(NSError **)error
{
    NSFileManager *fileManager = [NSFileManager defaultManager];
    BOOL isDirectory;
    if ([fileManager fileExistsAtPath:toPath isDirectory:&isDirectory] && !isDirectory) {
        if (cover) {
            [fileManager removeItemAtPath:toPath error:error];
            return [fileManager copyItemAtPath:path toPath:toPath error:error];
        }
    }
    return [[NSFileManager defaultManager] copyItemAtPath:path toPath:toPath error:error];
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

+ (NSArray *)listingPathsAtPath:(NSString *)path recursively:(BOOL)recursive withPredicate:(NSPredicate *)predicate
{
    NSArray *relativeSubpaths = (recursive ? [[NSFileManager defaultManager] subpathsOfDirectoryAtPath:path error:nil] : [[NSFileManager defaultManager] contentsOfDirectoryAtPath:path error:nil]);
    
    NSMutableArray *absoluteSubpaths = [[NSMutableArray alloc] init];
    
    for(NSString *relativeSubpath in relativeSubpaths)
    {
        NSString *absoluteSubpath = [path stringByAppendingPathComponent:relativeSubpath];
        [absoluteSubpaths addObject:absoluteSubpath];
    }
    
    NSArray *result = [NSArray arrayWithArray:absoluteSubpaths];
    if (predicate) {
        result = [result filteredArrayUsingPredicate:predicate];
    }
    return result;
}

+ (void)getDiskUsage:(void (^)(uint64_t freeSpace, uint64_t totalSpace, uint64_t myAppUsed))block
{
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        
        NSError *error = nil;
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        NSDictionary *dictionary = [[NSFileManager defaultManager] attributesOfFileSystemForPath:[paths lastObject] error: &error];
        
        uint64_t freeSpace = 0, totalSpace = 0, myAppUsed = 0;
        if (dictionary) {
            NSNumber *fileSystemSizeInBytes = [dictionary objectForKey: NSFileSystemSize];
            NSNumber *freeFileSystemSizeInBytes = [dictionary objectForKey:NSFileSystemFreeSize];
            totalSpace = [fileSystemSizeInBytes unsignedLongLongValue];
            freeSpace = [freeFileSystemSizeInBytes unsignedLongLongValue];
        } else {
            NSLog(@"Error Obtaining System Memory Info: %@", error);
        }
        
        myAppUsed = [self totalSizeOfItemAtPath:[self cachesDirectory] recursively:YES];
        myAppUsed += [self totalSizeOfItemAtPath:[self documentsDirectory] recursively:YES];
        myAppUsed += [self totalSizeOfItemAtPath:[self libraryDirectory] recursively:YES];
        myAppUsed += [self totalSizeOfItemAtPath:[self mainBundleDirectory] recursively:YES];
        myAppUsed += [self totalSizeOfItemAtPath:[self temporaryDirectory] recursively:YES];

        dispatch_async(dispatch_get_main_queue(), ^{
            block(freeSpace, totalSpace, myAppUsed);
        });
    });
}

+ (dispatch_source_t)monitorFileChangesInDirectory:(NSString *)dirPath changeHandler:(dispatch_block_t)handler
{
    NSParameterAssert(dirPath != nil);
    int fd = open(dirPath.UTF8String, O_EVTONLY);
    if (fd == -1) {
        NSLog(@"failed to monitorFileChangesInDirectory open");
        return NULL;
    }
    
    dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    
    dispatch_source_t source = dispatch_source_create(DISPATCH_SOURCE_TYPE_VNODE, fd, DISPATCH_VNODE_WRITE | DISPATCH_VNODE_DELETE, queue);
    
    if (source) {
        
        // Install the event handler to process the content change
        dispatch_source_set_event_handler(source, ^{
            
            unsigned long flag = dispatch_source_get_data(source);
            
            if (flag & DISPATCH_VNODE_WRITE || flag & DISPATCH_VNODE_DELETE) {
                
                if (handler) {
                    handler();
                }
            }
        });
        // Install a cancellation handler to free the descriptor
        // and the stored string.
        dispatch_source_set_cancel_handler(source, ^{
            char* fileStr = (char*)dispatch_get_context(source);
            free(fileStr);
            close(fd);
        });
        // Start processing events.
        dispatch_resume(source);
    }
    else
        close(fd);
    
    return source;
}

+ (NSString *)mimeTypeForFileExtension:(NSString *)ext
{
    if (ext.length == 0) {
        return nil;
    }
    // Borrowed from http://stackoverflow.com/questions/2439020/wheres-the-iphone-mime-type-database
    CFStringRef UTI = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, (__bridge CFStringRef)ext.lowercaseString, NULL);
    CFStringRef MIMEType = UTTypeCopyPreferredTagWithClass (UTI, kUTTagClassMIMEType);
    CFBridgingRelease(UTI);
    return CFBridgingRelease(MIMEType);
}


@end
