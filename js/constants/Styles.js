import {
  Dimensions,
  StyleSheet
} from 'react-native'

import Colors from './Colors'

export default {
  separatorBorderStyle: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cellBorder,
  },
  separatorViewStyle: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.cellBorder,
  }
}
