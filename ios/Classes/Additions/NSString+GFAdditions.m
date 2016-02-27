#import "NSString+GFAdditions.h"
#import <CommonCrypto/CommonDigest.h>

@implementation NSString (GFAdditions)

+ (NSString *)jm_stringFromDigest:(uint8_t *)digest length:(int)length {
  NSMutableString *ms = [[NSMutableString alloc] initWithCapacity:length * 2];
  for (int i = 0; i < length; i++) {
    [ms appendFormat: @"%02x", (int)digest[i]];
  }
  
  return [ms copy];
}

- (NSData *)jm_prehashData {
  const char *cstr = [self cStringUsingEncoding:NSUTF8StringEncoding];
  return [NSData dataWithBytes:cstr length:self.length];
}

- (NSString *)jm_MD5Digest {
  NSData *preHashData = [self jm_prehashData];
  uint8_t digest[CC_MD5_DIGEST_LENGTH];
  CC_MD5(preHashData.bytes, (CC_LONG)preHashData.length, digest);
  
  return [[self class] jm_stringFromDigest:digest length:CC_MD5_DIGEST_LENGTH];
}

@end

