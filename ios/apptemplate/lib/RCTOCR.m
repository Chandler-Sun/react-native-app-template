//
//  RCTOCR.m
//  SkrapitApp
//
//  Created by Chunan Wu on 21/06/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "RCTOCR.h"
#import <React/RCTLog.h>
#import <React/RCTImageLoader.h>

@implementation RCTOCR

@synthesize bridge = _bridge;

- (id)init {
  self = [super init];
  if (self != nil) {
    // Init Tesseract
    self.tesseract = [[G8Tesseract alloc] initWithLanguage:@"eng" engineMode:G8OCREngineModeTesseractOnly];
//                                                engineMode:G8OCREngineModeTesseractCubeCombined];
    self.tesseract.delegate = self;
    
    NSString* licenseFileName = @"aip";
    // Init Baidu SDK with license file
#ifdef STAGING
    licenseFileName = @"aip_Staging";
#endif
#ifdef DEBUG
    licenseFileName = @"aip_Debug";
#endif
    
    NSString *licenseFile = [[NSBundle mainBundle] pathForResource:licenseFileName ofType:@"license"];
    NSData *licenseFileData = [NSData dataWithContentsOfFile:licenseFile];
    if(licenseFileData) {
      [[AipOcrService shardService] authWithLicenseFileData:licenseFileData];
    }
  }
  return self;
}

// To export a module named CalendarManager
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(authWithAK:(NSString *)apikey andSK:(NSString *)secretkey) {
  [[AipOcrService shardService] authWithAK:apikey andSK:secretkey];
}

RCT_EXPORT_METHOD(authWithLicenseFile:(NSString *)licenseFilename
                  failureCallback:(RCTResponseErrorBlock)failureCallback
                  successCallback:(RCTResponseSenderBlock)successCallback) {
  NSString *licenseFile = [[NSBundle mainBundle] pathForResource:@"aip" ofType:@"license"];
  NSData *licenseFileData = [NSData dataWithContentsOfFile:licenseFile];
  if(!licenseFileData) {
    NSString *errorMessage = @"Can't find the license from the resources.";
    NSDictionary *userInfo = @{NSLocalizedFailureReasonErrorKey: NSLocalizedString(errorMessage, nil)};
    NSError * error = [NSError errorWithDomain:@"rn.rctutil" code:1 userInfo:userInfo];
    failureCallback(error);
    return;
  }
  [[AipOcrService shardService] authWithLicenseFileData:licenseFileData];
  successCallback(@[]);
}

RCT_EXPORT_METHOD(baiduOcrProcess:(NSString *)urlString
                  failureCallback:(RCTResponseErrorBlock)failureCallback
                  successCallback:(RCTResponseSenderBlock)successCallback) {
  NSURLRequest *url = [RCTConvert NSURLRequest:urlString];
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
        failureCallback(error);
        return;
      }
    }
    
    // Start Baidu OCR progress
    NSDictionary *options = @{@"language_type": @"CHN_ENG", @"detect_direction": @"true"};
    [[AipOcrService shardService] detectTextFromImage:image withOptions:options successHandler:^(id result) {
      successCallback(@[[NSNull null], result]);
    } failHandler:^(NSError *err) {
      failureCallback(err);
    }];
    
  }];
}

RCT_EXPORT_METHOD(tessOcrProcess:(NSString *)urlString
                  failureCallback:(RCTResponseErrorBlock)failureCallback
                  successCallback:(RCTResponseSenderBlock)successCallback) {
  NSURLRequest *url = [RCTConvert NSURLRequest:urlString];
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
        failureCallback(error);
        return;
      }
    }
    
    // Specify the image Tesseract should recognize on
    self.tesseract.image = [image g8_blackAndWhite];
    // Limit recognition time with a few seconds
    self.tesseract.maximumRecognitionTime = 10.0;
    // Start the recognition
    [self.tesseract recognize];
    
    NSArray *characterBoxes = [self.tesseract recognizedBlocksByIteratorLevel:G8PageIteratorLevelTextline];
    
    // Adapt the paragraphs to be Baidu response structure.
    NSNumber *wordsResultNum = [NSNumber numberWithInt:(int)[characterBoxes count]];
    NSMutableDictionary *result = [NSMutableDictionary dictionaryWithCapacity:2];
    int height = image.size.height;
    int width = image.size.width;
    
    NSMutableArray *wordsResult = [[NSMutableArray alloc] init];
    for (G8RecognizedBlock *block in characterBoxes) {
      NSDictionary *blockLocation = @{@"left": [NSNumber numberWithFloat:(block.boundingBox.origin.x * width)],
                                      @"top": [NSNumber numberWithFloat:(block.boundingBox.origin.y * height)],
                                      @"width": [NSNumber numberWithFloat:(block.boundingBox.size.width * width)],
                                      @"height": [NSNumber numberWithFloat:(block.boundingBox.size.height * height)]};
      NSString *blockWords = block.text;
      NSDictionary *blockResult = @{@"location": blockLocation, @"words": blockWords};
      [wordsResult addObject:blockResult];
    }
    
    result[@"words_result_num"] = wordsResultNum;
    result[@"words_result"] = wordsResult;
    
    successCallback(@[[NSNull null], result]);
  }];
}

RCT_EXPORT_METHOD(fusedOcrProcess:urlString
                  failureCallback:(RCTResponseErrorBlock)failureCallback
                  successCallback:(RCTResponseSenderBlock)successCallback) {
  // 1. Use Baidu SDK to recognize the target image
  NSURLRequest *url = [RCTConvert NSURLRequest:urlString];
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
        failureCallback(error);
        return;
      }
    }
    
    // Start Baidu OCR progress
    NSDictionary *options = @{@"language_type": @"CHN_ENG", @"detect_direction": @"true"};
    [[AipOcrService shardService] detectTextFromImage:image withOptions:options successHandler:^(id result) {
      // 2. Iterate each of the recognized blocks and re-run all the eng-only results with local Tesseract framework.
      NSString * pattern = @"[\\u0000-\\u007F]";
      NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern: pattern
                                                                             options:0
                                                                               error:NULL];
      int indexOfWordsBlocks = 0;
      NSMutableDictionary * resultSet = [(NSMutableDictionary *)result mutableCopy];
      NSMutableArray * wordsResultArray = [(NSMutableArray *)result[@"words_result"] mutableCopy];
      for (NSDictionary * wordsBlock in result[@"words_result"]) {
        NSString * wordsText = wordsBlock[@"words"];
        CGFloat scale = 1.0;
        
        // Screen scale calibration
        /*
         * FIXME: should use real image size to calculate the scale factor.
         */
        if (image.size.height > 2048.0) {
          scale = image.size.height / 2048.0; // 2048px: Baidu OCR SDK will resize the image to the maximum size: 2048px.
        }
        
        // If the wordsText contains only eng characters
        // Assuming you have some NSString `myString`.
        NSUInteger matches = [regex numberOfMatchesInString:wordsText
                                                    options:0
                                                      range:NSMakeRange(0, [wordsText length])];
        if (matches == [wordsText length]) {
          // 3. Re-run the block of the source image with the eng-only enabled Tesseract framework
          double croppedX = [wordsBlock[@"location"][@"left"] doubleValue] * scale;
          double croppedY = [wordsBlock[@"location"][@"top"] doubleValue] * scale;
          double croppedWidth = [wordsBlock[@"location"][@"width"] doubleValue]* scale;
          if (croppedX + croppedWidth + RELAXATION_WIDTH <= image.size.width) {
            croppedWidth = croppedWidth + RELAXATION_WIDTH;
          }
          double croppedHeight = [wordsBlock[@"location"][@"height"] doubleValue] * scale;
          CGRect block = CGRectMake(croppedX, croppedY, croppedWidth, croppedHeight);
          // Crop the original image with the eng-only CGRect
          CGImageRef subImage = CGImageCreateWithImageInRect(image.CGImage, block);
          UIImage * croppedImage = [UIImage imageWithCGImage:subImage];
          CGImageRelease(subImage);
          
          // Re-run recognition with cropped image
          // Specify the image Tesseract should recognize on
          self.tesseract.image = [croppedImage g8_blackAndWhite];
          // Limit recognition time with a few seconds
          self.tesseract.maximumRecognitionTime = 10.0;
          // Start the recognition
          [self.tesseract recognize];
          
          NSArray *characterBoxes = [self.tesseract recognizedBlocksByIteratorLevel:G8PageIteratorLevelTextline];
          
          // Adapt the paragraphs to be Baidu response structure.
          NSMutableArray *wordsResult = [[NSMutableArray alloc] init];
          if(characterBoxes){
            for (G8RecognizedBlock *block in characterBoxes) {
              NSString *blockWords = block.text;
              [wordsResult addObject:blockWords];
            }
          }
          
          if([wordsResult count] > 0){
            // Fuse the Tesseract result with Baidu's response
            wordsText = wordsResult[0];
          }
          
        }
        
        //transform with scale
        NSDictionary *blockLocation = @{@"left": [NSNumber numberWithInt:[wordsBlock[@"location"][@"left"] doubleValue] * scale],
                                        @"top": [NSNumber numberWithInt:[wordsBlock[@"location"][@"top"] doubleValue] * scale],
                                        @"width": [NSNumber numberWithInt:([wordsBlock[@"location"][@"width"] doubleValue] + RELAXATION_WIDTH) * scale],
                                        @"height": [NSNumber numberWithInt:[wordsBlock[@"location"][@"height"] doubleValue] * scale]};
        
        NSDictionary *blockResult = @{@"location": blockLocation, @"words": wordsText};
        
        wordsResultArray[indexOfWordsBlocks] = blockResult;

        
        indexOfWordsBlocks = indexOfWordsBlocks + 1;
      }
      
      [resultSet setObject:[wordsResultArray copy] forKey:@"words_result"];
      
      successCallback(@[[NSNull null], [resultSet copy]]);
    } failHandler:^(NSError *err) {
      failureCallback(err);
    }];
    
  }];
}

RCT_EXPORT_METHOD(optzFusedOcrProcess:urlString
                  failureCallback:(RCTResponseErrorBlock)failureCallback
                  successCallback:(RCTResponseSenderBlock)successCallback) {
  // 1. Use Baidu SDK to recognize the target image
  NSURLRequest *url = [RCTConvert NSURLRequest:urlString];
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
        failureCallback(error);
        return;
      }
    }
    
    // Start Baidu OCR progress
    NSDictionary *options = @{@"language_type": @"CHN_ENG", @"detect_direction": @"true"};
    [[AipOcrService shardService] detectTextFromImage:image withOptions:options successHandler:^(id result) {
      // 2. Iterate each of the recognized blocks and re-run all the eng-only results with local Tesseract framework.
      int indexOfWordsBlocks = 0;
      NSMutableDictionary * resultSet = [(NSMutableDictionary *)result mutableCopy];
      NSMutableArray * wordsResultArray = [(NSMutableArray *)result[@"words_result"] mutableCopy];
      CGFloat scale = 1.0;
      // Screen scale calibration
      /*
       * FIXME: should use real image size to calculate the scale factor.
       */
      if (image.size.height > 2048.0) {
        scale = image.size.height / 2048.0; // 2048px: Baidu OCR SDK will resize the image to the maximum size: 2048px.
      }
      
      NSDate *methodStart = [NSDate date];
      
      for (NSDictionary * wordsBlock in result[@"words_result"]) {
        NSString * wordsText = wordsBlock[@"words"];

        [self tesseractOcrSmallBlockProcess:image
                                     inRect:wordsBlock
                                  withScale:scale
                                 referWords:wordsText
                                    atIndex:indexOfWordsBlocks
                                    inArray:wordsResultArray];
    
      
        indexOfWordsBlocks = indexOfWordsBlocks + 1;
      }
     
      [resultSet setObject:[wordsResultArray copy] forKey:@"words_result"];
      
      NSDate *methodFinish = [NSDate date];
      NSTimeInterval executionTime = [methodFinish timeIntervalSinceDate:methodStart];
      NSLog(@"executionTime = %f", executionTime);
      successCallback(@[[NSNull null], [resultSet copy]]);
     
    } failHandler:^(NSError *err) {
      failureCallback(err);
    }];
  }];
}

- (void)tesseractOcrSmallBlockProcess:(UIImage *)image
                                         inRect:(NSDictionary *)wordsBlock
                                      withScale:(CGFloat) scale
                                     referWords:(NSString *)wordsText
                                        atIndex:(int)index
                                        inArray:(NSMutableArray *)lines{
  NSString * pattern = @"[\\u0000-\\u007F]";
  NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern: pattern
                                                                         options:0
                                                                           error:NULL];
  // If the wordsText contains only eng characters
  // Assuming you have some NSString `myString`.
  NSUInteger matches = [regex numberOfMatchesInString:wordsText
                                              options:0
                                                range:NSMakeRange(0, [wordsText length])];
  // The line matched is a pure English
  if (matches == [wordsText length]) {
    // 3. Re-run the block of the source image with the eng-only enabled Tesseract framework
    double croppedX = [wordsBlock[@"location"][@"left"] doubleValue] * scale;
    double croppedY = [wordsBlock[@"location"][@"top"] doubleValue] * scale;
    double croppedWidth = [wordsBlock[@"location"][@"width"] doubleValue]* scale;
    if (croppedX + croppedWidth + RELAXATION_WIDTH <= image.size.width) {
      croppedWidth = croppedWidth + RELAXATION_WIDTH;
    }
    double croppedHeight = [wordsBlock[@"location"][@"height"] doubleValue] * scale;
    CGRect block = CGRectMake(croppedX, croppedY, croppedWidth, croppedHeight);
    
    // Crop the original image with the eng-only CGRect
    CGImageRef subImage = CGImageCreateWithImageInRect(image.CGImage, block);
    UIImage * croppedImage = [UIImage imageWithCGImage:subImage];
    CGImageRelease(subImage);
    
    // Re-run recognition with cropped image
    // Specify the image Tesseract should recognize on
    self.tesseract.image = [croppedImage g8_blackAndWhite];
    // Limit recognition time with a few seconds
    self.tesseract.maximumRecognitionTime = 10.0;
    // Start the recognition
    [self.tesseract recognize];
    
    NSArray *characterBoxes = [self.tesseract recognizedBlocksByIteratorLevel:G8PageIteratorLevelTextline];
    
    // Adapt the paragraphs to be Baidu response structure.
    NSMutableArray *wordsResult = [[NSMutableArray alloc] init];
    if(characterBoxes){
      for (G8RecognizedBlock *block in characterBoxes) {
        NSString *blockWords = block.text;
        [wordsResult addObject:blockWords];
      }
    }
    
    if([wordsResult count] > 0){
      // Fuse the Tesseract result with Baidu's response
      wordsText = wordsResult[0];
    }
    
    // If wordsText is not nil
    if (wordsText) {
      //transform with scale
      NSDictionary *blockLocation = @{@"left": [NSNumber numberWithInt:block.origin.x],
                                      @"top": [NSNumber numberWithInt:block.origin.y],
                                      @"width": [NSNumber numberWithInt:(block.size.width + RELAXATION_WIDTH)],
                                      @"height": [NSNumber numberWithInt:block.size.height]};
      
      NSString *postProcessedWordsText = [wordsText stringByTrimmingCharactersInSet:[NSCharacterSet newlineCharacterSet]];
      
      NSDictionary *blockResult = @{@"location": blockLocation, @"words": postProcessedWordsText};
      lines[index] = blockResult;
    }
  } else {
    //transform with scale
    NSDictionary *blockLocation = @{@"left": [NSNumber numberWithInt:[wordsBlock[@"location"][@"left"] doubleValue] * scale],
                                    @"top": [NSNumber numberWithInt:[wordsBlock[@"location"][@"top"] doubleValue] * scale],
                                    @"width": [NSNumber numberWithInt:([wordsBlock[@"location"][@"width"] doubleValue] + RELAXATION_WIDTH) * scale],
                                    @"height": [NSNumber numberWithInt:[wordsBlock[@"location"][@"height"] doubleValue] * scale]};
    
    NSDictionary *blockResult = @{@"location": blockLocation, @"words": wordsText};
    
    lines[index] = blockResult;
  }
}

@end
