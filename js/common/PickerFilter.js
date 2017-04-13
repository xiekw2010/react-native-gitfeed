import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ScrollView,
  SegmentedControlIOS
} from 'react-native'
import Colors from '../constants/Colors'
import Layout from '../constants/Layout'
import CStyles from '../constants/Styles'
import Menu, {
  MenuContext,
  MenuTrigger,
  MenuOptions,
  MenuOption,
  renderers
} from 'react-native-popup-menu'
import Icon from 'react-native-vector-icons/Ionicons'

class PickerFilter extends Component {
  state = {
    selectedMenu: '',
    crtMenus: [],
    isSubMenu: false
  }

  componentDidMount() {
    const { menus, defaultSelectedMenu } = this.props
    const isSubMenu = typeof menus[0] !== 'string'

    let crtMenus = [], selectedMenu
    if (isSubMenu) {
      menus.forEach((main, index) => {
        const mainKey = Object.keys(main)[0]
        crtMenus.push(mainKey)
        const subMenus = main[mainKey]
        subMenus.forEach(sub => {
          crtMenus.push(sub)
        })
      })
      selectedMenu = defaultSelectedMenu || {}
    } else {
      crtMenus = menus
      selectedMenu = defaultSelectedMenu || ''
    }

    this.setState({
      selectedMenu,
      crtMenus,
      isSubMenu
    })
  }


  onSelectMenu(menu) {
    const { menus, onChange } = this.props
    const { selectedMenu, isSubMenu } = this.state
    if (isSubMenu) {
      let mainMenu
      for (let i = 0; i < menus.length; i++) {
        const mm = menus[i]
        const mainKey = Object.keys(mm)[0]
        const subMenus = mm[mainKey]
        if (!!~subMenus.indexOf(menu)) {
          mainMenu = mainKey
          break
        }
      }
      console.log(`select menu is ${mainMenu} ${menu}`)
      const selectedObj = {}
      selectedObj[mainMenu] = menu
      this.setState({
        selectedMenu: { ...selectedMenu, ...selectedObj },
      })
      onChange && onChange(mainMenu, menu)
    } else {
      console.log(`select menu is ${menu}`)
      onChange && onChange(menu)
    }

    return true
  }

  render() {
    const { menus, style } = this.props
    const { selectedMenu, crtMenus, isSubMenu } = this.state

    const allMainMenus = menus.map(obj => Object.keys(obj)[0])
    const selectedMenus = !isSubMenu ?
      selectedMenu :
      Object
        .keys(selectedMenu)
        .map(k => selectedMenu[k])
        .reduce((a, b) => a.concat(b), [])

    const menuOptions = crtMenus
      .map((menu, i) => {
        const isMainMenu = !!~allMainMenus.indexOf(menu)
        const isSelected = !!~selectedMenus.indexOf(menu)
        const checkMark = isSelected ? '\u2713' : ''
        const color = isSelected ? Colors.blue : Colors.lightBlack
        const mainMenuStyle = isMainMenu ?
        { ...CStyles.separatorBorderStyle, color: '#ccc' } : {}
        return <MenuOption value={menu} key={i} disabled={isMainMenu}>
          <Text style={[{color}, mainMenuStyle]}>{`${checkMark}${ menu}`}</Text>
        </MenuOption>
      })

    return (
      <TouchableOpacity style={style}>
        <Menu onSelect={this.onSelectMenu.bind(this)}>
          <MenuTrigger customStyles={{ alignSelf: 'center'}}>
            <Icon name={'ios-funnel'}
                  size={Layout.navIconSize.width}
                  color={Colors.lightBlack}
                  style={Layout.navIconSize}/>
          </MenuTrigger>
          <MenuOptions>
            {menuOptions}
          </MenuOptions>
        </Menu>
      </TouchableOpacity>
    )
  }
}

// 1. menus is like ['a', 'b', 'c'],
// 1. onChange(a)
// 2. menus is like [{menu1: ['subMenu1', 'subMenu2' ]}, {menu2: ['subMenu1', 'subMenu2' ]},]
// 2. onChange(menu1, subMenu1)
PickerFilter.propTypes = {
  menus: PropTypes.array,
  onChange: PropTypes.func,
  defaultSelectedMenu: PropTypes.object
}
PickerFilter.defaultProps = {
  menus: []
}

export default PickerFilter
