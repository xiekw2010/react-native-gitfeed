//
//  DXTextCategoryMenu.m
//  RN_CNNode
//
//  Created by xiekw on 15/10/23.
//  Copyright © 2015年 Facebook. All rights reserved.
//

#import "DXTextCategoryMenu.h"
#import "RCTConvert.h"

@interface _TextButton : UIButton

+ (instancetype)textButtonWithString:(NSString *)text selectedColor:(UIColor *)sColor unSelectedColor:(UIColor *)uScolor;

@end

@implementation _TextButton

+ (instancetype)textButtonWithString:(NSString *)text selectedColor:(UIColor *)sColor unSelectedColor:(UIColor *)uScolor {
  _TextButton *btn = [_TextButton new];
  [btn setTitle:text forState:UIControlStateNormal];
  [btn setTitleColor:uScolor forState:UIControlStateNormal];
  [btn setTitleColor:sColor forState:UIControlStateSelected];
  [btn sizeToFit];
  
  return btn;
}

- (instancetype)init {
  if (self = [super init]) {
    self.backgroundColor = [UIColor clearColor];
  }
  
  return self;
}

@end

@interface _MenuScrollView : UIScrollView

@end

@implementation _MenuScrollView

- (BOOL)touchesShouldCancelInContentView:(UIView *)view {
  return YES;
}

@end

@interface DXTextCategoryMenu ()<UIScrollViewDelegate>

@property (nonatomic, strong) NSMutableArray *textButtons;
@property (nonatomic, assign) NSUInteger selectedIndex;
@property (nonatomic, strong) UIView *bottomLine;
@property (nonatomic, strong) UIVisualEffectView *blurEffectView;

@end

@implementation DXTextCategoryMenu {
  _MenuScrollView *_scrollView;
  UIButton *_expandButton;
  struct {
    unsigned int delegateImpWillSelect: 1;
    unsigned int delegateImpDidSelect: 1;
  }_delegateFlags;
  BOOL _dirty;
  BOOL _animating;
}

- (void)_commonInit {
  _delegateFlags.delegateImpWillSelect = 0;
  _delegateFlags.delegateImpDidSelect = 0;
  _dirty = NO;
  
  self.blurEffectStyle = UIBlurEffectStyleExtraLight;
  
  self.backgroundColor = [UIColor clearColor];
  
  _scrollView = [_MenuScrollView new];
  _scrollView.delaysContentTouches = NO;
  _scrollView.canCancelContentTouches = YES;
  _scrollView.showsHorizontalScrollIndicator = NO;
  _scrollView.showsVerticalScrollIndicator = NO;
  _scrollView.scrollsToTop = NO;
  _scrollView.delegate = self;
  _scrollView.frame = self.bounds;
  [self addSubview:_scrollView];

//  self.selectedColor = [RCTConvert UIColor:@(f61d4b)];
//  self.unSelectedColor = [RCTConvert UIColor:@(666666)];
  self.contentInset = UIEdgeInsetsMake(2.0, 5, 2.0, 5);
  self.spacingBetweenMenu = 20.0;
  
  _selectedIndex = -1;
  _bottomLineHeight = 2.0;
  _selectedAnimationDuration = 0.25;
  _needCenterMenuOffset = 100.0;
  
  self.blur = YES;
}

- (void)_applyShadows {
  self.layer.shadowPath = [UIBezierPath bezierPathWithRect:self.bounds].CGPath;
  self.layer.shadowColor = [UIColor blackColor].CGColor;
  self.layer.shadowOpacity = 0.17f;
  self.layer.shadowRadius = 0.5f;
  self.layer.shadowOffset = CGSizeMake(0, 0.4);
}

- (void)setDelegate:(id<DXTextCategoryMenuDelegate>)delegate {
  if (_delegate == delegate) {
    return;
  }
  
  _delegate = delegate;
  _delegateFlags.delegateImpWillSelect = [_delegate respondsToSelector:@selector(textCategoryMenu:willSelectedMenuFromIndex:toIndex:)];
  _delegateFlags.delegateImpDidSelect = [_delegate respondsToSelector:@selector(textCategoryMenu:didSelectedMenuFromIndex:toIndex:)];
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    [self _commonInit];
  }
  
  return self;
}

- (instancetype)init {
  if (self = [super init]) {
    [self _commonInit];
  }
  
  return self;
}

- (void)layoutSubviews {
  [super layoutSubviews];
  
  if (_dirty) {
    _scrollView.frame = self.bounds;
    _blurEffectView.effect = [UIBlurEffect effectWithStyle:self.blurEffectStyle];
    _blurEffectView.frame = self.bounds;
    [self _applyShadows];
    
    [self _reset];
    
    CGFloat startX = self.contentInset.left;
    CGFloat height = CGRectGetHeight(_scrollView.bounds);
    
    CGFloat previousX = startX;
    for (NSUInteger i = 0; i < _options.count; i ++) {
      NSString *option = _options[i];
      _TextButton *textButton = [_TextButton textButtonWithString:option selectedColor:self.selectedColor unSelectedColor:self.unSelectedColor];
      CGSize textButtonSize = textButton.bounds.size;
      CGFloat startY = (height - self.contentInset.top - self.contentInset.bottom - textButtonSize.height) * 0.5;
      textButton.frame = CGRectMake(previousX + i * self.spacingBetweenMenu, startY, textButtonSize.width, textButtonSize.height);
      textButton.tag = i;
      [textButton addTarget:self action:@selector(textButtonDidTapped:) forControlEvents:UIControlEventTouchUpInside];
      [_scrollView addSubview:textButton];
      [self.textButtons addObject:textButton];
      
      previousX += textButtonSize.width;
    }
    
    _scrollView.contentSize = CGSizeMake(previousX + self.spacingBetweenMenu * (_options.count - 1) + self.contentInset.right, height);
    
    self.bottomLine.frame = CGRectMake(0, CGRectGetHeight(_scrollView.bounds) - _bottomLineHeight, 0, _bottomLineHeight);
    [_scrollView addSubview:self.bottomLine];
    
    _selectedIndex = 0;
    _TextButton *firstBtn = [_textButtons firstObject];
    firstBtn.selected = YES;
    [self _moveBottomLineToSelectedButton];
    _dirty = NO;
  }
}

- (void)setBlur:(BOOL)blur {
  if (_blur == blur || ![UIVisualEffect class]) {
    self.backgroundColor = [UIColor whiteColor];
    return;
  }
  
  _blur = blur;
  if (_blur) {
    self.backgroundColor = [UIColor clearColor];
    self.blurEffectView.frame = self.bounds;
    [self insertSubview:self.blurEffectView belowSubview:_scrollView];
  } else {
    [self.blurEffectView removeFromSuperview];
    self.backgroundColor = [UIColor whiteColor];
  }
}

- (UIVisualEffectView *)blurEffectView {
  if (!_blurEffectView) {
    UIVisualEffect *blurEffect = [UIBlurEffect effectWithStyle:self.blurEffectStyle];
    UIVisualEffectView *visualEffectView = [[UIVisualEffectView alloc] initWithEffect:blurEffect];
    _blurEffectView = visualEffectView;
  }
  
  return _blurEffectView;
}

- (void)setBlurEffectStyle:(UIBlurEffectStyle)effectStyle {
  if (_blurEffectStyle == effectStyle) {
    return;
  }
  
  _blurEffectStyle = effectStyle;
  _dirty = YES;
}

- (void)setBackgroundColor:(UIColor *)backgroundColor {
  if (self.blur || [self.backgroundColor isEqual:backgroundColor]) {
    return;
  }
  
  [super setBackgroundColor:backgroundColor];
  _scrollView.backgroundColor = backgroundColor;
}

- (void)_removeAllScollViewSubViews {
  for (UIView *vv in self.textButtons) {
    [vv removeFromSuperview];
  }
}

- (void)_reset {
  [self _removeAllScollViewSubViews];
  [self.textButtons removeAllObjects];
  _selectedIndex = -1;
  [self.bottomLine removeFromSuperview];
}

- (void)setOptions:(NSArray *)options {
  _options = options;
  _dirty = YES;
}

- (void)updateSelectedIndex:(NSInteger)index {
  [self setSelectedIndex:index notifyDelegate:NO];
}

- (void)setSelectedIndex:(NSUInteger)selectedIndex notifyDelegate:(BOOL)notify {
  if (_selectedIndex == selectedIndex || _animating) {
    return;
  }
  
  if (selectedIndex >= _options.count) {
    NSLog(@"*** [DXTextCategoryMenu] selected index is out of range with %lu from %lu", (unsigned long)selectedIndex, (unsigned long)_options.count);
    return;
  }
  
  NSUInteger orginIndex = _selectedIndex;
  
  if (notify && _delegateFlags.delegateImpWillSelect) {
    [_delegate textCategoryMenu:self willSelectedMenuFromIndex:orginIndex toIndex:selectedIndex];
  }
  
  _selectedIndex = selectedIndex;
  [_textButtons enumerateObjectsUsingBlock:^(_TextButton *btn, NSUInteger idx, BOOL * _Nonnull stop) {
      btn.selected = idx == _selectedIndex;
  }];
  
  [self _setNeedCenterScrollView];
  [self _moveBottomLineToSelectedButton];
 
  if (notify && _delegateFlags.delegateImpDidSelect) {
    [_delegate textCategoryMenu:self didSelectedMenuFromIndex:orginIndex toIndex:_selectedIndex];
  }
}

- (void)_moveBottomLineToSelectedButton {
  if (_animating) {
    return;
  }
  _animating = YES;
  CGRect currentLineBounds = self.bottomLine.bounds;
  CGPoint targetCenter = self.bottomLine.center;
  CGRect targetBounds = currentLineBounds;
  
  _TextButton *currentBtn = _textButtons[_selectedIndex];
  targetCenter.x = currentBtn.center.x;
  targetBounds.size.width = CGRectGetWidth(currentBtn.bounds);
  
  [UIView animateWithDuration:self.selectedAnimationDuration animations:^{
    self.bottomLine.center = targetCenter;
    self.bottomLine.bounds = targetBounds;
  } completion:^(BOOL finished) {
    _animating = NO;
  }];
}

- (void)_setNeedCenterScrollView {
  _TextButton *btn = _textButtons[_selectedIndex];
  
  CGFloat scrollViewWidth = CGRectGetWidth(_scrollView.frame);
  CGPoint scrollViewContentOffset = _scrollView.contentOffset;
  CGFloat currentX = btn.center.x - scrollViewContentOffset.x;
  
  if (currentX < self.needCenterMenuOffset) {
    NSUInteger next2 = _selectedIndex + 2;
    NSUInteger nextButtonIndex = next2 < _options.count - 1 ? next2 : _selectedIndex + 1 ;
    if (nextButtonIndex > _options.count - 1) {
      return;
    }
    _TextButton *nextBtn = _textButtons[nextButtonIndex];
    CGFloat needMoved = nextBtn.center.x - btn.center.x;
    _TextButton *firstBtn = [_textButtons firstObject];
    CGFloat minMove = btn.center.x - firstBtn.center.x;
    needMoved = MIN(needMoved, minMove);
    needMoved = scrollViewContentOffset.x - needMoved;
    if (needMoved <= 0 || firstBtn == btn) {
      needMoved = 0;
    }
    [_scrollView setContentOffset:CGPointMake(needMoved, 0) animated:YES];
  }
  
  if (scrollViewWidth - currentX < self.needCenterMenuOffset) {
    NSInteger previous2 = _selectedIndex - 2;
    NSInteger previousButtonInex = previous2 > 0 ? previous2 : _selectedIndex - 1;
    if (previousButtonInex < 0) {
      return;
    }
    _TextButton *previousBtn = _textButtons[previousButtonInex];
    CGFloat needMoved = previousBtn.center.x - btn.center.x;
    _TextButton *lastBtn = [_textButtons lastObject];
    CGFloat minMove = btn.center.x - lastBtn.center.x;
    needMoved = MAX(needMoved, minMove);
    needMoved = scrollViewContentOffset.x - needMoved;
    if (needMoved >= _scrollView.contentSize.width - scrollViewWidth || lastBtn == btn) {
      needMoved = _scrollView.contentSize.width - scrollViewWidth;
    }
    [_scrollView setContentOffset:CGPointMake(needMoved, 0) animated:YES];
  }
}

- (void)textButtonDidTapped:(_TextButton *)button {
  NSUInteger tag = button.tag;
  
  [self setSelectedIndex:tag notifyDelegate:YES];
}

- (void)setSelectedColor:(UIColor *)selectedColor {
  if ([_selectedColor isEqual:selectedColor]) {
    return;
  }
  
  _selectedColor = selectedColor;
  for (_TextButton *btn in self.textButtons) {
    [btn setTitleColor:_selectedColor forState:UIControlStateSelected];
  }
  
  self.bottomLine.backgroundColor = _selectedColor;
}

- (void)setUnSelectedColor:(UIColor *)unSelectedColor {
  if ([_unSelectedColor isEqual:unSelectedColor]) {
    return;
  }
  
  _unSelectedColor = unSelectedColor;
  for (_TextButton *btn in self.textButtons) {
    [btn setTitleColor:_unSelectedColor forState:UIControlStateNormal];
  }
}

- (UIView *)bottomLine {
  if (!_bottomLine) {
    _bottomLine = [[UIView alloc] init];
    _bottomLine.backgroundColor = self.selectedColor;
  }
  
  return _bottomLine;
}

- (void)setBottomLineHeight:(CGFloat)bottomLineHeight {
  if (_bottomLineHeight == bottomLineHeight) {
    return;
  }
  
  self.bottomLine.bounds = CGRectMake(0, 0, CGRectGetWidth(self.bottomLine.bounds), _bottomLineHeight);
}

- (NSMutableArray *)textButtons {
  if (!_textButtons) {
    _textButtons = [NSMutableArray array];
  }
  
  return _textButtons;
}

@end
