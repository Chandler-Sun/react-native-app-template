//
//  SMSSender.m
//  reactnativeutils
//
//  Created by Rishabh Mehan on 9/20/15.
//  Copyright © 2015 DareU. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RCTUtils.h"
#import <CoreTelephony/CTCallCenter.h>
#import <CoreTelephony/CTCall.h>
#import <React/RCTImageLoader.h>
#import "Async.h"

@interface RCTUtils ()

@property (nonatomic, strong) MFMessageComposeViewController *controller;
@property (nonatomic, strong) RCTResponseSenderBlock callback;

@end
@implementation RCTUtils

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

/***********************
 METHOD 1: sendSMS - method to send message (author: Rishabh Mehan)
 ***********************/
RCT_EXPORT_METHOD(sendSMS:(NSString *)bodyOfMessage recipientList:(NSArray *)recipients callback:(RCTResponseSenderBlock)callback)
{
  /**
   * A method to send sms to one or many contacts
   * @params bodyOfMessage the text that is to be sent.
   * @params recipients an array of numbers who are to be sent a SMS.
   * @params callback callback to send response to the caller
   */
  self.callback = callback;
  UIViewController *root = [[[[UIApplication sharedApplication] delegate] window] rootViewController];
  MFMessageComposeViewController *controller = [[MFMessageComposeViewController alloc] initWithNibName:nil bundle:nil];
  if([MFMessageComposeViewController canSendText])
  {
    controller.body = bodyOfMessage;
    controller.recipients = recipients;
    controller.messageComposeDelegate = self;
    dispatch_async(dispatch_get_main_queue(), ^{
      [root presentViewController:controller animated:YES completion:nil];
    });
  }
}

- (void)messageComposeViewController:(MFMessageComposeViewController *)controller didFinishWithResult:(MessageComposeResult)result
{
  [controller dismissViewControllerAnimated:YES completion:NULL];
  if (result == MessageComposeResultCancelled){
    self.callback(@[@"cancelled"]);
  } else if (result == MessageComposeResultSent){
    self.callback(@[@"sent"]);
  } else{
    self.callback(@[@"failed"]);
  }
}

/***********************
 METHOD 2: openSettings - method to open app settings directly (author: Rishabh Mehan)
 ***********************/

RCT_EXPORT_METHOD(openSettings)
{
  [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]];
}

/***********************
 METHOD 3: isOnCall - method to check if the person is on a call. (author: Rishabh Mehan)
 ***********************/

RCT_EXPORT_METHOD(isOnCall:(RCTResponseSenderBlock)callback)
{
  self.callback = callback;
  CTCallCenter *ctCallCenter = [[CTCallCenter alloc] init];
  if (ctCallCenter.currentCalls != nil)
  {
    NSArray* currentCalls = [ctCallCenter.currentCalls allObjects];
    for (CTCall *call in currentCalls)
    {
      if(call.callState == CTCallStateConnected)
      {
        self.callback(@[@"yes"]);
      }
    }
  } else {
    self.callback(@[@"no"]);
  }
}

RCT_EXPORT_METHOD(shareMultipleAssets:(NSDictionary *)options
failureCallback:(RCTResponseErrorBlock)failureCallback
                  successCallback:(RCTResponseSenderBlock)successCallback)
{
  
  NSArray *assets = [RCTConvert NSArray:options[@"urls"]];
  
  [Async mapParallel:assets
         mapFunction:^(id obj, mapSuccessBlock success, mapFailBlock failure) {
           NSURLRequest *url = [RCTConvert NSURLRequest:obj];
           
           [_bridge.imageLoader loadImageWithURLRequest:url callback:^(NSError *error, UIImage *image) {
             if (error || image == nil) {
               NSString *path = [[url URL] absoluteString];
               if ([path hasPrefix:@"data:"] || [path hasPrefix:@"file:"]) {
                 NSURL *imageUrl = [[NSURL alloc] initWithString:path];
                 image = [UIImage imageWithData:[NSData dataWithContentsOfURL:imageUrl]];
               } else {
                 image = [[UIImage alloc] initWithContentsOfFile:path];
               }
               if (image == nil) {
                 NSString *errorMessage = @"Can't retrieve the file from the path.";
                 NSDictionary *userInfo = @{NSLocalizedFailureReasonErrorKey: NSLocalizedString(errorMessage, nil)};
                 error = [NSError errorWithDomain:@"rn.rctutil" code:1 userInfo:userInfo];
                 failure(error);
                 return;
               }
             }
             success(image);
           }];

         }
         success:^(NSArray *mappedArray) {
           dispatch_async(dispatch_get_main_queue(), ^{
             UIActivityViewController* activityViewController =
             [[UIActivityViewController alloc] initWithActivityItems:mappedArray
                                               applicationActivities:nil];
             UIViewController *ctrl = [[[[UIApplication sharedApplication] delegate] window] rootViewController];
             [ctrl presentViewController:activityViewController animated:YES completion:nil];
             successCallback(@[]);
           });
         }
         failure:^(NSError *error) {
           failureCallback(error);
         }
   ];
}


bool saveImageToFS(NSString * fullPath, UIImage * image, NSString * format, float quality)
{
  NSData* data = nil;
  if ([format isEqualToString:@"JPEG"]) {
    data = UIImageJPEGRepresentation(image, quality / 100.0);
  } else if ([format isEqualToString:@"PNG"]) {
    data = UIImagePNGRepresentation(image);
  }
  
  if (data == nil) {
    return NO;
  }
  
  NSFileManager* fileManager = [NSFileManager defaultManager];
  [fileManager createFileAtPath:fullPath contents:data attributes:nil];
  return YES;
}

NSString * generateNewFilePath(NSString * ext, NSString * outputPath)
{
  NSString* directory;
  
  if ([outputPath length] == 0) {
    NSArray* paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
    directory = [paths firstObject];
  } else {
    directory = outputPath;
  }
  
  NSString* name = [[NSUUID UUID] UUIDString];
  NSString* fullName = [NSString stringWithFormat:@"%@.%@", name, ext];
  NSString* fullPath = [directory stringByAppendingPathComponent:fullName];
  
  return fullPath;
}

RCT_EXPORT_METHOD(saveImage:(NSString *)path
                  format:(NSString *)format
                  quality:(float)quality
                  outputPath:(NSString *)outputPath
                  callback:(RCTResponseSenderBlock)callback)
{
  NSString* fullPath = nil;
  
  if ([format isEqualToString:@"PNG"]) {
    fullPath = generateNewFilePath(@"png", outputPath);
  }else{
    fullPath = generateNewFilePath(@"jpg", outputPath);
  }
  
  
  [_bridge.imageLoader loadImageWithURLRequest:[RCTConvert NSURLRequest:path] callback:^(NSError *error, UIImage *image) {
    if (error || image == nil) {
      if ([path hasPrefix:@"data:"] || [path hasPrefix:@"file:"]) {
        NSURL *imageUrl = [[NSURL alloc] initWithString:path];
        image = [UIImage imageWithData:[NSData dataWithContentsOfURL:imageUrl]];
      } else {
        image = [[UIImage alloc] initWithContentsOfFile:path];
      }
      if (image == nil) {
        callback(@[@"Can't retrieve the file from the path.", @""]);
        return;
      }
    }
    
    // Compress and save the image
    if (!saveImageToFS(fullPath, image, format, quality)) {
      callback(@[@"Can't save the image. Check your compression format.", @""]);
      return;
    }
    
    callback(@[[NSNull null], fullPath]);
  }];
}


RCT_EXPORT_METHOD(saveBatchImagesToDisk:(NSDictionary *)options
                  format:(NSString *)format
                  quality:(float)quality
                  outputPath:(NSString *)outputPath
                  failureCallback:(RCTResponseErrorBlock)failureCallback
                  successCallback:(RCTResponseSenderBlock)successCallback)
{
  
  NSArray *assets = [RCTConvert NSArray:options[@"URIs"]];
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    [Async mapParallel:assets
           mapFunction:^(id obj, mapSuccessBlock success, mapFailBlock failure) {
             [self saveImage:obj format:format quality:quality outputPath:outputPath callback:^(NSArray *response) {
               if([response[0] isEqual:[NSNull null]]){
                 success(response[1]);
               }else{
                 failure(response[0]);
               }
             }];
           }
           success:^(NSArray *mappedArray) {
             successCallback(@[[NSNull null], mappedArray]);
           }
           failure:^(NSError *error) {
             failureCallback(error);
           }
     ];
  });
}

RCT_EXPORT_METHOD(sendSnapNotification:(NSString *)message imageKey:(NSString *)key options:(NSDictionary *)options)
{
  
}


@end
