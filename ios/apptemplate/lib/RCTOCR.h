//
//  RCTOCR.h
//  SkrapitApp
//
//  Created by Chunan Wu on 21/06/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

// CalendarManager.h
#import <React/RCTBridgeModule.h>
#import <AipOcrSdk/AipOcrSdk.h>
#import <TesseractOCR/TesseractOCR.h>

#define RELAXATION_WIDTH 5

@interface RCTOCR : NSObject <RCTBridgeModule, AipOcrDelegate, G8TesseractDelegate>

@property G8Tesseract * tesseract;
- (void)tesseractOcrSmallBlockProcess:(UIImage *)image
                               inRect:(NSDictionary *)wordsBlock
                            withScale:(CGFloat) scale
                           referWords:(NSString *)wordsText
                              atIndex:(int)index
                              inArray:(NSMutableArray *)lines;
@end
