//
//  VydiaRNFileUploader.m
//  Vydia
//
//  Created by Kenneth Leland on 12/8/16.
//  Copyright © 2016 Vydia. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <MobileCoreServices/MobileCoreServices.h>
#import "RCTEventEmitter.h"
#import "RCTBridgeModule.h"


@interface VydiaRNFileUploader : RCTEventEmitter <RCTBridgeModule, NSURLSessionTaskDelegate>
@end

@implementation VydiaRNFileUploader

RCT_EXPORT_MODULE();

static int uploadId = 0;

@synthesize bridge = _bridge;

static NSString *BACKGROUND_SESSION_ID = @"VydiaRNFileUploader-%i";
NSURLSession *_urlSession = nil;

- (NSArray<NSString *> *)supportedEvents {
    return @[@"RNFileUploader-progress", @"RNFileUploader-error", @"RNFileUploader-completed"];
}


/*
 Gets file information for the path specified.  Example valid path is: file:///var/mobile/Containers/Data/Application/3C8A0EFB-A316-45C0-A30A-761BF8CCF2F8/tmp/trim.A5F76017-14E9-4890-907E-36A045AF9436.MOV
 Returns an object such as: {mimeType: "video/quicktime", size: 2569900, exists: true, name: "trim.AF9A9225-FC37-416B-A25B-4EDB8275A625.MOV", extension: "MOV"}
 */
RCT_EXPORT_METHOD(getFileInfo:(NSString *)path resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSURL *fileUri = [NSURL URLWithString: path];
        NSString *pathWithoutProtocol = [fileUri path];

        NSString *name = [fileUri lastPathComponent];
        NSString *extension = [name pathExtension];
        bool exists = [[NSFileManager defaultManager] fileExistsAtPath:pathWithoutProtocol];
        NSMutableDictionary *params = [NSMutableDictionary dictionaryWithObjectsAndKeys: name, @"name", nil];

        [params setObject:extension forKey:@"extension"];
        [params setObject:[NSNumber numberWithBool:exists] forKey:@"exists"];

        if (exists)
        {
            [params setObject:[self guessMIMETypeFromFileName:name] forKey:@"mimeType"];
            NSError* error;
            NSDictionary<NSFileAttributeKey, id> *attributes = [[NSFileManager defaultManager] attributesOfItemAtPath:pathWithoutProtocol error:&error];
            if (error == nil)
            {
                unsigned long long fileSize = [attributes fileSize];
                [params setObject:[NSNumber numberWithLong:fileSize] forKey:@"size"];
            }
        }

        resolve(params);
    }
    @catch (NSException *exception) {
        reject(@"RN Uploader", exception.name, nil);
    }
}

// Borrowed from http://stackoverflow.com/questions/2439020/wheres-the-iphone-mime-type-database
- (NSString *)guessMIMETypeFromFileName: (NSString *)fileName {
    CFStringRef UTI = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, (__bridge CFStringRef)[fileName pathExtension], NULL);
    CFStringRef MIMEType = UTTypeCopyPreferredTagWithClass(UTI, kUTTagClassMIMEType);
    CFRelease(UTI);
    if (!MIMEType) {
        return @"application/octet-stream";
    }
    return (__bridge NSString *)(MIMEType);
}


/*
 * Starts a file upload.
 * Options are passed in as the first argument as a js hash:
 * {
 *   url: string.  url to post to.
 *   path: string.  path to the file on the device
 *   headers: hash of name/value header pairs
 * }
 *
 * Returns a promise with the string ID of the upload.
 */
RCT_EXPORT_METHOD(startUpload:(NSDictionary *)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    int thisUploadId;
    @synchronized(self.class)
    {
        thisUploadId = uploadId++;
    }
    NSString *uploadUrl = options[@"url"];
    NSString *fileURI = options[@"path"];
    NSDictionary *headers = options[@"headers"];

    @try {
        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString: uploadUrl]];
        request.HTTPMethod = @"POST";
        [headers enumerateKeysAndObjectsUsingBlock:^(id  _Nonnull key, id  _Nonnull val, BOOL * _Nonnull stop) {
            if ([val respondsToSelector:@selector(stringValue)]) {
                val = [val stringValue];
            }
            if ([val isKindOfClass:[NSString class]]) {
                [request setValue:val forHTTPHeaderField:key];
            }
        }];
        NSURLSessionDataTask *uploadTask = [[self urlSession:thisUploadId] uploadTaskWithRequest:request fromFile:[NSURL URLWithString: fileURI]];
        uploadTask.taskDescription = [NSString stringWithFormat:@"%i", thisUploadId];
        [uploadTask resume];
        resolve(uploadTask.taskDescription);
    }
    @catch (NSException *exception) {
        reject(@"RN Uploader", exception.name, nil);
    }
}

- (NSURLSession *)urlSession: (int) thisUploadId{

    NSURLSessionConfiguration *sessionConfigurationt = [NSURLSessionConfiguration backgroundSessionConfigurationWithIdentifier:
                                                        [NSString stringWithFormat:BACKGROUND_SESSION_ID,thisUploadId]];
    _urlSession = [NSURLSession sessionWithConfiguration:sessionConfigurationt delegate:self delegateQueue:nil];

    return _urlSession;
}


#pragma NSURLSessionTaskDelegate

- (void)URLSession:(NSURLSession *)session
              task:(NSURLSessionTask *)task
didCompleteWithError:(NSError *)error {
    NSMutableDictionary *data = [NSMutableDictionary dictionaryWithObjectsAndKeys:task.taskDescription, @"id", nil];
    NSURLSessionDataTask *uploadTask = (NSURLSessionDataTask *)task;
    NSHTTPURLResponse *response = (NSHTTPURLResponse *)uploadTask.response;
    if (response != nil)
    {
        [data setObject:[NSNumber numberWithInteger:response.statusCode] forKey:@"responseCode"];
    }

    if (error == nil)
    {
        [self sendEventWithName:@"RNFileUploader-completed" body:data];
    }
    else
    {
        [data setObject:error.localizedDescription forKey:@"error"];
        [self sendEventWithName:@"RNFileUploader-error" body:data];
    }
}

- (void)URLSession:(NSURLSession *)session
              task:(NSURLSessionTask *)task
   didSendBodyData:(int64_t)bytesSent
    totalBytesSent:(int64_t)totalBytesSent
totalBytesExpectedToSend:(int64_t)totalBytesExpectedToSend {
    float progress = -1;
    if (totalBytesExpectedToSend > 0) //see documentation.  For unknown size it's -1 (NSURLSessionTransferSizeUnknown)
    {
        progress = 100.0 * (float)totalBytesSent / (float)totalBytesExpectedToSend;
    }

    [self sendEventWithName:@"RNFileUploader-progress" body:@{ @"id": task.taskDescription, @"progress": [NSNumber numberWithFloat:progress] }];
}

@end
