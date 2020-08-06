//  VydiaRNFileUploader.h

#import <Foundation/Foundation.h>
#import <MobileCoreServices/MobileCoreServices.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface VydiaRNFileUploader : RCTEventEmitter <RCTBridgeModule, NSURLSessionTaskDelegate>
+ (void)setCompletionHandlerWithIdentifier: (NSString *)identifier completionHandler: (void (^)())completionHandler;
@end

