//
//  RNConfig.m
//  SkrapitApp
//
//  Created by Chandler Sun on 2017/6/26.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RNConfig.h"

@implementation RNConfig

RCT_EXPORT_MODULE();

- (NSDictionary *)constantsToExport
{
  NSString* buildEnvironment = [[[NSBundle mainBundle] infoDictionary] valueForKey:@"BuildEnvironment"];
  return @{ @"buildEnvironment": buildEnvironment };
}

@end
