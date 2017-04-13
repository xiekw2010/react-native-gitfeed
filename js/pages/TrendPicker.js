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
import { changeLanguage, changeRule } from '../actions/language'
import { connect } from 'react-redux'
import store from '../store/configureStore'
import PickerFilter from '../common/PickerFilter'
import { defaultState } from '../reducers/language'

class LanguagePicker extends Component {
  onChange(main, sub) {
    if (main && sub) {
      if (main === 'choose sort') {
        store.dispatch(changeRule(sub))
      }

      if (main === 'choose languages') {
        store.dispatch(changeLanguage(sub))
      }
    }
  }

  render() {
    const { currentRule, currentLanguage } = this.props
    return (
      <PickerFilter
        menus={[
          {
            'choose sort': defaultState.rules
          },
          {
            'choose languages': defaultState.trendingLanguages
          }
        ]}
        onChange={this.onChange.bind(this)}
        defaultSelectedMenu={{
          'choose sort': currentRule,
          'choose languages': currentLanguage
        }}
      />
    )
  }

}

LanguagePicker.propTypes = {}
LanguagePicker.defaultProps = {}

const select = state => {
  return {
    currentRule: state.language.currentRule,
    currentLanguage: state.language.currentLanguage
  }
}

export default connect(select)(LanguagePicker)
