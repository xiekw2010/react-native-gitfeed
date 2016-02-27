//
//  DXFileManager.h
//  DXFileManager
//
//  Created by xiekw on 15/2/10.
//  Copyright (c) 2015年 xiekw. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface DXFileManager : NSObject

/*usual paths*/

+ (NSString *)cachesDirectory;

+ (NSString *)documentsDirectory;

+ (NSString *)libraryDirectory;

+ (NSString *)mainBundleDirectory;

+ (NSString *)temporaryDirectory;

/*create, delete, move, copy*/

//create directory
+(BOOL)createDirectoriesForPath:(NSString *)path error:(NSError **)error;
//write file, it will overide the file exist, it the path is the same
+(BOOL)writeFileAtPath:(NSString *)path content:(NSObject *)content;

//delete directory or file
+(BOOL)removeItemAtPath:(NSString *)path error:(NSError **)error;
//delete file
+(BOOL)removeFilesInDirectoryAtPath:(NSString *)path withExtension:(NSString *)extension;
//The predicate is for the array in this path.
+(BOOL)removeFilesInDirectoryAtPath:(NSString *)path withPredicate:(NSPredicate *)predicate;

//Move, if the Item is a file and Cover == YES, it will remove the origin and use the new one.
//If the item is a directory, cover makes none sense
+(BOOL)moveItemAtPath:(NSString *)path toPath:(NSString *)toPath ifCover:(BOOL)cover error:(NSError **)error;

//Use the same rule as moveItem API
+ (BOOL)renameItemAtPath:(NSString *)path withName:(NSString *)name error:(NSError **)error;

//copy
+(BOOL)copyItemAtPath:(NSString *)path toPath:(NSString *)toPath ifCover:(BOOL)cover error:(NSError **)error;

/*calculate size*/

//the size of item at path, if the path is directory, it will recursively calculate the size
+ (uint64_t)totalSizeOfItemAtPath:(NSString *)path recursively:(BOOL)recursive;

/*listing the complete paths for the path, the preicate items is the whole path not the subpath, so maybe you need to use [path pathExtension] to get last extension*/
+ (NSArray *)listingPathsAtPath:(NSString *)path recursively:(BOOL)recursive withPredicate:(NSPredicate *)predicate;

+ (void)getDiskUsage:(void (^)(uint64_t freeSpace, uint64_t totalSpace, uint64_t myAppUsed))block;

+ (dispatch_source_t)monitorFileChangesInDirectory:(NSString *)dirPath changeHandler:(dispatch_block_t)handler;

+ (NSString *)mimeTypeForFileExtension:(NSString *)ext;


@end
