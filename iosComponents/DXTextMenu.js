/* @flow weak */

var React = require('react-native');
const { requireNativeComponent } = require('react-native');
const DXCategoryMenuManager = require('NativeModules').DXCategoryMenuManager;
const EdgeInsetsPropType = require('EdgeInsetsPropType');

var CategoryTextMenu = React.createClass({
  propTypes: {
    options: React.PropTypes.array,
    onSelectedIndexChange: React.PropTypes.func,
    lockStartPosition: React.PropTypes.bool,
    selectedColor: React.PropTypes.string,
    unSelectedColor: React.PropTypes.string,
    contentInset: EdgeInsetsPropType,
    spacingBetweenMenu: React.PropTypes.number,
    bottomLineHeight: React.PropTypes.number,
    selectedAnimationDuration: React.PropTypes.number,
    needCenterMenuOffset: React.PropTypes.bool,
    blur: React.PropTypes.bool,
    // [0, 1, 2] for [ExtraLight, light, dark]
    blurEffectStyle: React.PropTypes.number,
  },

  _onChange(event) {
    if (!this.props.onSelectedIndexChange) {
      return;
    }

    const ne = event.nativeEvent;
    this.props.onSelectedIndexChange(ne.from, ne.to);
  },

  updateSelectedIndex(node, selectedIndex) {
    var nodeHandle = React.findNodeHandle(node) || 1;
    DXCategoryMenuManager.updateSelectedIndex(nodeHandle, selectedIndex);
  },

  render() {
    return (
      <DXTextCategoryMenu
      {...this.props}
      onChange={this._onChange}
      />
    )
  }
});

const DXTextCategoryMenu  = requireNativeComponent('DXCategoryMenu', DXTextCategoryMenu);

module.exports = CategoryTextMenu;
