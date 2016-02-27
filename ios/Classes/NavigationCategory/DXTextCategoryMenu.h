//
//  DXTextCategoryMenu.h
//  RN_CNNode
//
//  Created by xiekw on 15/10/23.
//  Copyright © 2015年 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>

@class DXTextCategoryMenu;

@protocol DXTextCategoryMenuDelegate <NSObject>

@optional
- (void)textCategoryMenu:(DXTextCategoryMenu *)menu willSelectedMenuFromIndex:(NSInteger)fromIndex toIndex:(NSInteger)index;

- (void)textCategoryMenu:(DXTextCategoryMenu *)menu didSelectedMenuFromIndex:(NSInteger)fromIndex toIndex:(NSInteger)index;

@end

@interface DXTextCategoryMenu : UIView

@property (nonatomic, weak) id<DXTextCategoryMenuDelegate> delegate;
@property (nonatomic, strong) NSArray *options;

// If the first item stays the position when others scroll
@property (nonatomic, assign) BOOL lockStartPosition;

// Selected color, default is red
@property (nonatomic, strong) UIColor *selectedColor;

// UnSelected color, default is lightgray
@property (nonatomic, strong) UIColor *unSelectedColor;

// The menu contentInset in container. default is {2, 5, 2, 5}
@property (nonatomic, assign) UIEdgeInsets contentInset;

// Each text menu between space
@property (nonatomic, assign) CGFloat spacingBetweenMenu;

// The bottom line height, default is 2
@property (nonatomic, assign) CGFloat bottomLineHeight;

// The bottom line animation flys default is 0.25
@property (nonatomic, assign) CGFloat selectedAnimationDuration;

// The trigger scrollView autoscroll space between the side, default is 100
@property (nonatomic, assign) CGFloat needCenterMenuOffset;

// If use the system blur, default is YES
@property (nonatomic, assign, getter=isBlur) BOOL blur;

// If blur which style to use, defaut is extra light
@property (nonatomic, assign) UIBlurEffectStyle blurEffectStyle;

- (void)updateSelectedIndex:(NSInteger)index;

@end
