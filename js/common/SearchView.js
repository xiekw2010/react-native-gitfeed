import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput
} from 'react-native'
import Colors from '../constants/Colors'
import Icon from 'react-native-vector-icons/Ionicons'
import { create } from '../common/F8StyleSheet'
import { connect } from 'react-redux'
import { startSearch, enqueueSearchHistory } from '../actions/search'

const SCREEN_WIDTH = Dimensions.get('window').width

export const SearchButton = ({ onPress, placeholder, rightPadding }) => {
  return (
    <TouchableOpacity
      style={[styles.searchBarButton,  {
        width: SCREEN_WIDTH - 30 - rightPadding,
        justifyContent: 'center'
      }]}
      onPress={onPress}>
      <Icon
        name={'ios-search'}
        size={20}
        style={styles.searchIcon}
        color={Colors.textGray}
      />
      <Text style={styles.textInputButton}>
        {placeholder}
      </Text>
    </TouchableOpacity>
  )
}

SearchButton.propTypes = {
  placeholder: PropTypes.string,
  onPress: PropTypes.func,
  rightPadding: PropTypes.number
}
SearchButton.defaultProps = {
  placeholder: 'search users, repos',
  onPress: _ => {},
  rightPadding: 0
}

const select = state => {
  return {
    value: state.search.searchText
  }
}

export const SearchInput = connect(select)(({
  hideCancel,
  placeholder,
  rightPadding,
  value,
  dispatch
}) => {
  const width = hideCancel ? 10 : 50
  const totalWidth = SCREEN_WIDTH - width - rightPadding
  return (
    <View style={[styles.searchBarButton,
    { width: totalWidth}]}>
      <Icon
        name={'ios-search'}
        size={20}
        style={styles.searchIcon}
        color={Colors.lightBlack}
      />
      <TextInput
        style={[styles.textInput, { width: totalWidth - 30}]}
        placeholder={placeholder}
        autoFocus={true}
        clearButtonMode={'always'}
        autoCapitalize={'none'}
        autoCorrect={false}
        onChangeText={text => dispatch(startSearch(text, 'INPUT'))}
        value={value}
        onSubmitEditing={e => {
          const text = e.nativeEvent.text
          dispatch(startSearch(text, 'INPUT'))
          dispatch(enqueueSearchHistory(text))
        }}
      />
    </View>
  )
})

export const SearchFilter = ({ placeholder, onChangeText, style}) => {
  return (
    <View style={[style, styles.searchFilterContainer]}>
      <TextInput
        style={styles.filterText}
        placeholder={placeholder}
        clearButtonMode={'always'}
        autoCapitalize={'none'}
        autoCorrect={false}
        onChangeText={onChangeText}
        onSubmitEditing={e => {
          const text = e.nativeEvent.text
          onChangeText(text)
        }}
      />
    </View>
  )
}

SearchFilter.propTypes = {
  placeholder: PropTypes.string,
  onChangeText: PropTypes.func
}
SearchFilter.defaultProps = {
  placeholder: 'Tap to filter',
  onChangeText: _ => {}
}

SearchInput.propTypes = {
  hideCancel: PropTypes.bool,
  placeholder: PropTypes.string,
  onChangeText: PropTypes.func,
  onSubmit: PropTypes.func,
  rightPadding: PropTypes.number
}
SearchInput.defaultProps = {
  hideCancel: false,
  placeholder: '',
  onChangeText: _ => {},
  onSubmit: _ => {},
  rightPadding: 0
}

const styles = create({
  searchBarContainer: {
    padding: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH - 6,
  },
  searchBarButton: {
    padding: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 4,
    marginTop: 5,
    backgroundColor: 'rgba(240, 239, 244, 0.7)',
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: 'normal',
    margin: 5,
    color: Colors.lightBlack,
    textAlign: 'center'
  },
  searchIcon: {
    marginLeft: 3,
    marginRight: 3,
    width: 20,
    height: 20
  },
  textInputButton: {
    fontSize: 16,
    color: Colors.lightBlack,
    alignSelf: 'center',
  },
  textInput: {
    fontSize: 15,
    alignSelf: 'stretch',
    width: SCREEN_WIDTH - 30,
    color: Colors.black,
    android: {
      padding: 0,
    }
  },
  searchFilterContainer: {
    borderBottomColor: Colors.tintColor,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingLeft: 5,
    paddingRight: 5
  },
  filterText: {
    fontSize: 15,
    alignSelf: 'stretch',
    flex: 1,
    color: Colors.black,
  }
})
