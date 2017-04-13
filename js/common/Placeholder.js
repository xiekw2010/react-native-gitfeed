import React, { PropTypes, Component } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import Colors from '../constants/Colors'
import { Paragraph, NormalText, Heading2, Text } from './F8Text'

export const ErrorPlaceholder = ({ title, desc, onPress, buttonText }) => {
  return (
    <View style={styles.container}>
      <Heading2>
        {title}
      </Heading2>
      <Paragraph style={styles.desc}>
        {desc}
      </Paragraph>
      <TouchableOpacity style={styles.reloadText} onPress={onPress}>
        <NormalText style={styles.errorText}>
          {buttonText}
        </NormalText>
      </TouchableOpacity>
    </View>
  )
}

ErrorPlaceholder.propTypes = {
  title: PropTypes.string,
  desc: PropTypes.string,
  buttonText: PropTypes.string,
  onPress: PropTypes.func
}
ErrorPlaceholder.defaultProps = {
  title: 'Oops',
  desc: 'some thing wrong...',
  onPress: _ => {},
  buttonText: 'Reload'
}

export const LoadingPlaceholder = ({ title, big }) => {
  if (big) {
    return <View style={styles.container}>
      <ActivityIndicator size={'large'}/>
    </View>
  } else {
    return <View style={styles.container}>
      <ActivityIndicator size={'small'}/>
      <Text style={styles.loadingText}>
        {title}
      </Text>
    </View>
  }
}

LoadingPlaceholder.propTypes = {
  title: PropTypes.string,
  big: PropTypes.bool
}
LoadingPlaceholder.defaultProps = {
  title: 'Loading...',
  big: false
}

export const EmptyPlaceholder = props => {
  const image = props.image &&
    <Image style={styles.image} source={props.image}/>
  const title = props.title &&
    <Heading1 style={styles.title}>{props.title}</Heading1>

  return (
    <View style={[styles.container, props.style]}>
      {image}
      {title}
      <Paragraph style={styles.text}>
        {text}
      </Paragraph>
      {props.children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  reloadText: {
    borderColor: Colors.textGray,
    borderWidth: 1,
    borderRadius: 3,
    marginTop: 20,
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10
  },

  loadingText: {
    marginTop: 5,
    color: Colors.textGray
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  image: {
    marginBottom: 10,
  },
  text: {
    textAlign: 'center',
    marginBottom: 35,
  },
  desc: {
    padding: 20,
    textAlign: 'center',
  }
})
