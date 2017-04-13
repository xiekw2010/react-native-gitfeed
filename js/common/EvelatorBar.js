import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  NativeModules,
  EdgeInsetsPropType,
  Platform,
  findNodeHandle
} from 'react-native'

const RCTUIManager = NativeModules.UIManager;
const TimerMixin = require('react-timer-mixin');
const DEFAULT_LAYOUT = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
}

const EvelatorBar = React.createClass({
  _allMenuRefs: [],
  _scvWidth: -1,
  _scvContentOffsetX: 0,
  _lastTextLayout: DEFAULT_LAYOUT,
  _firstTextLayout: DEFAULT_LAYOUT,

  mixins: [TimerMixin],

  propTypes: {
    menus: React.PropTypes.array.isRequired,
    /**
     * (menuItem, index, isSelected) => return a menuComponent
     */
    renderMenu: React.PropTypes.func.isRequired,
    /**
     * this Evelator height, default is 40
     */
    height: React.PropTypes.number.isRequired,
    /**
     * When trigger scroll edge offset, default is 100
     */
    triggerScrollEdgeOffset: React.PropTypes.number,
    /**
     * default selected index, default is 0
     */
    defaultSelectedIndex: React.PropTypes.number,
    /**
     * Item spacing, default is 10
     */
    itemSpacing: React.PropTypes.number,
    /**
     * (fromIndex, toIndex) => {}.
     * for manual scroll to some index, use `selectToMenu` instead
     */
    onSelectMenu: React.PropTypes.func,
    /**
     * items in scrollViews'edge
     * default is {top: 5, left: 5, bottom: 5, right: 5}
     */
    contentInset: EdgeInsetsPropType,
  },

  selectToMenu(index) {
    this._goToMenu(index, false);
  },

  getInitialState() {
    let defaultSelectedIndex = this.props.defaultSelectedIndex;
    if (defaultSelectedIndex < 0 || defaultSelectedIndex > this.props.menus.length - 1) {
      defaultSelectedIndex = 0;
    }
    return {
      selectedMenu: defaultSelectedIndex || 0,
    }
  },

  getDefaultProps() {
    return {
      height: 40,
      triggerScrollEdgeOffset: 100,
      defaultSelectedIndex: 0,
      itemSpacing: 10,
      contentInset: { top: 5, left: 5, bottom: 5, right: 5 },
    }
  },

  componentDidMount() {
    setTimeout(_ => this.requestAnimationFrame(() => {
      this.selectToMenu(this.state.selectedMenu)
    }), 500)
  },

  _goToMenu(index, notify) {
    if (notify) {
      this.props.onSelectMenu && this.props.onSelectMenu(this.state.selectedMenu, index);
    }
    this.setState({
      selectedMenu: index,
    });
    this._setNeedScrollToMenu(index);
  },

  _renderMenuOption(menuItem, index) {
    const isSelected = this.state.selectedMenu === index;
    const renderedMenu = this.props.renderMenu(menuItem, index, isSelected);
    if (!renderedMenu) {
      console.log('*** Evelator"s renderMenu must be implementated');
      return null;
    }

    const isFirst = index === 0;
    const isLast = index === this.props.menus.length - 1;
    let itemSpacing = this.props.itemSpacing;
    let textLayout;
    if (isFirst) {
      textLayout = (e) => this._firstTextLayout = e.nativeEvent.layout;
      itemSpacing = 0;
    }
    if (isLast) {
      textLayout = (e) => this._lastTextLayout = e.nativeEvent.layout;
    }

    const eleKey = index + 1;
    return (
      <TouchableOpacity key={eleKey}
                        style={{ marginLeft: itemSpacing }}
                        onPress={() => {this._goToMenu(index, true)}}
                        ref={(text) => this._allMenuRefs[index] = text}
                        underlayColor={this.props.menuUnderlayColor}
                        onLayout={textLayout}
      >
        <View style={[styles.touchOpacity]}>
          {renderedMenu}
        </View>
      </TouchableOpacity>
    );
  },

  _setNeedScrollToMenu(index) {
    const menuText = findNodeHandle(this._allMenuRefs[index]);
    if (!menuText) {
      return;
    }
    const needScrollOffset = this.props.triggerScrollEdgeOffset;
    const _scvWidth = this._scvWidth;
    const movedX = this._scvContentOffsetX;
    const lastTextLayout = this._lastTextLayout;

    RCTUIManager.measure(menuText, (x, y, w, h, px, py) => {
      // textLayout
      let isAndroid = Platform.OS === 'android';

      const sharedX = isAndroid ? px : x;
      const textStart = sharedX;
      const textEnd = sharedX + w;
      const inst = this.props.contentInset;
      const textMoved = isAndroid ? 0 : movedX;

      let scrollTo = -1;
      let needMove = _scvWidth / 2;
      let maxMove = lastTextLayout.x + lastTextLayout.width - _scvWidth + inst.right;
      if (isAndroid) {
        maxMove -= movedX;
      }
      if (textEnd - textMoved > _scvWidth - needScrollOffset) {
        needMove = needMove + textEnd - _scvWidth;
        if (needMove < maxMove) {
          scrollTo = needMove;
        } else {
          scrollTo = maxMove;
        }
        if (isAndroid) {
          scrollTo += movedX;
        }
      } else if (textStart - textMoved < needScrollOffset) {
        maxMove = movedX;
        if (needMove > maxMove) {
          scrollTo = 0;
        } else {
          scrollTo = movedX - needMove;
        }
      }

      if (scrollTo != -1) {
        this.scv.scrollTo({ y: 0, x: Math.floor(scrollTo) });
      }
    });
  },

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.selectedMenu !== this.state.selectedMenu;
  },

  render() {
    const height = this.props.height;
    const inst = this.props.contentInset;
    const appendContainerStyle = {
      height: height,
      paddingTop: inst.top,
      paddingLeft: inst.left,
      paddingBottom: inst.bottom,
      paddingRight: inst.right,
    }

    return (
      <View style={[this.props.style, { height: height }]}>
        <ScrollView
          contentContainerStyle={[styles.scvContainerStyle, appendContainerStyle]}
          horizontal={true}
          automaticallyAdjustContentInsets={false}
          directionalLockEnabled={true}
          alwaysBounceVertical={false}
          showsHorizontalScrollIndicator={false}
          ref={(scv) => this.scv = scv}
          onLayout={(e) => this._scvWidth = e.nativeEvent.layout.width}
          onScroll={(e) => this._scvContentOffsetX = e.nativeEvent.contentOffset.x}
          scrollEventThrottle={16}
        >
          {this.props.menus.map((menu, i) => this._renderMenuOption(menu, i))}
        </ScrollView>
      </View>
    );
  },
});


const styles = StyleSheet.create({
  scvContainerStyle: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  tabView: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  touchOpacity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});

module.exports = EvelatorBar;
