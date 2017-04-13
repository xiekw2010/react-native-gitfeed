import React, {
  Component,
  PropTypes,
} from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native'
import Colors from '../constants/Colors'
import { connect } from 'react-redux'
import { onboard } from '../actions/login'
import { getUserInfo } from '../services/GithubServices'

class OnboardPage extends Component {
  constructor() {
    super()
    this.state = {
      username: '',
      loadingError: null,
      loading: false
    }

    this.submitOnboard = this.submitOnboard.bind(this)
  }

  submitOnboard() {
    const { username } = this.state
    if (!username.length) return

    this.setState({
      loadingError: null,
      loading: true
    })

    getUserInfo(username)
      .then(user => {
        this.setState({
          loadingError: null,
          loading: false
        })
        this.props.dispatch(onboard(user))
      })
      .catch(err => {
        this.setState({
          loadingError: err,
          loading: false
        })
      })
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    const loginErr = nextState.loadingError != this.state.loadingError
    const loading = nextState.loading != this.state.loading

    return loginErr || loading
  }
  
  render() {
    let failedDesc
    if (this.state.loadingError) {
      failedDesc = (
        <Text
          style={{color: Colors.red}}>{this.state.loadingError.message}
        </Text>
      )
    }
    
    let loading
    if (this.state.loading) {
      loading = <ActivityIndicator size='small' animating={true}/>
    }

    let top = Platform.OS === 'android' ? 30 : 40
    return (
      <ScrollView style={{backgroundColor: 'white'}}>
        <View style={[styles.container, {top: top}]}>
          <Image
            style={styles.welcomeImage}
            source={require('../../AppIcons/ios/iTunesArtwork.png')}/>
          <View style={styles.loginContainer}>
            <TextInput
              autoCapitalize={'none'}
              autoCorrect={false}
              style={styles.textInput}
              returnKeyType={'done'}
              onChangeText={username => this.setState({ username })}
              onSubmitEditing={this.submitOnboard}
              placeholder={'Github username (NOT EMAIL!)'}
            />
            <TouchableHighlight
              style={styles.go}
              onPress={this.submitOnboard}
              underlayColor={Colors.backGray}
            >
              <Text style={[styles.nameAndPwd, {'textAlign': 'center'}]}>
                Go!
              </Text>
            </TouchableHighlight>
          </View>
          {loading}
          {failedDesc}
        </View>
      </ScrollView>
    )
  }
}

OnboardPage.propTypes = {}
OnboardPage.defaultProps = {}

export default connect()(OnboardPage)

const styles = StyleSheet.create({
  container: {
    top: 40,
    flexDirection: 'column',
    alignItems: 'center',
    height: 300,
    backgroundColor: 'white'
  },

  welcomeImage: {
    width: 150,
    height: 150,
    backgroundColor: Colors.imagePlaceholder
  },

  loginContainer: {
    flexDirection: 'row',
    margin: 30,
    height: 44,
    alignSelf: 'stretch',
    marginTop: 20
  },

  textInput: {
    margin: 5,
    fontSize: 15,
    borderWidth: 1,
    height: 30,
    alignSelf: 'stretch',
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 4,
    padding: 3,
    borderColor: Colors.cellBorder,
    flex: 1
  },

  go: {
    margin: 5,
    marginBottom: 10,
    flexDirection: 'column',
    backgroundColor: 'white',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    borderRadius: 4,
    borderColor: Colors.cellBorder
  },

  nameAndPwd: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'black',
    width: 40
  }
})
