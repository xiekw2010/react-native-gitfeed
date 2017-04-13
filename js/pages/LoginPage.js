import React, {
  Component,
  PropTypes,
} from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native'
import Layout from '../constants/Layout'
import Colors from '../constants/Colors'
import { basicLogin } from '../services/GithubServices'
import { login } from '../actions/login'
import { connect } from 'react-redux'
import { NavigationStyles } from '@exponent/ex-navigation'
import { Text, Heading2 } from '../common/F8Text'
import { withNavigation } from '@exponent/ex-navigation'

@withNavigation
class LoginPage extends Component {
  static route = {
    styles: {
      ...NavigationStyles.SlideVertical,
    },
    navigationBar: {
      title: 'Better login in'
    }
  }

  constructor(props) {
    super()
    this.state = {
      username: props.user.login,
      loading: false,
      loadingError: null,
      password: null,
      needTFA: false,
      tfaToken: null,
    }
    this.login = this.login.bind(this)
  }

  _validFields(username, password) {
    if (!username || !username.length) {
      throw new Error(`username is empty`)
    }

    if (!password || !password.length) {
      throw new Error(`password is empty`)
    }

    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

    if (validateEmail(username)) {
      throw new Error(`username should not be email, just the alias is fine`)
    }
  }

  async login() {
    const { username, password, tfaToken } = this.state
    const { dispatch, navigator, didLogin } = this.props
    this.setState({ loading: true, loadingError: null })
    try {
      this._validFields(username, password)
      const user = await basicLogin(username, password, tfaToken)
      dispatch(login({
        login: username,
        pwd: password,
        token: user.token
      }))
      navigator.pop()
      didLogin && didLogin()
    } catch (err) {
      if (~err.message.indexOf('two-factor')) {
        this.setState({ needTFA: true, })
      }
      this.setState({ loadingError: err, })
    } finally {
      this.setState({ loading: false, })
    }
  }

  render() {
    const { loading, loadingError, needTFA } = this.state

    let signInContent
    if (loading) {
      signInContent = <ActivityIndicator size={'small'}/>
    } else {
      signInContent = <Text style={[styles.nameAndPwd, {textAlign: 'center',}]}>
        Sign in
      </Text>
    }

    let errDesc
    if (loadingError) {
      errDesc = <View style={styles.errorPlaceholder}>
        <Heading2 style={{color: Colors.red}}>
          {loadingError.message}
        </Heading2>
      </View>
    }

    let tfaInput
    if (needTFA) {
      tfaInput = (
        <View>
          <Text style={styles.nameAndPwd}>
            two-factor token
          </Text>
          <TextInput
            style={styles.textInput}
            returnKeyType={'done'}
            onChangeText={v => this.setState({ tfaToken: v, })}
            defaultValue={''}
            keyboardType={'numeric'}
          />
        </View>
      )
    }

    return (
      <ScrollView
        style={styles.container}
        contentInset={Layout.contentInset}
        contentOffset={{x:0, y:-Layout.contentInset.top}}
      >
        <View style={styles.loginCard}>
          <View style={styles.up}>
            <Text style={styles.introText}>
              Sign in to Github
            </Text>
          </View>
          <View style={styles.down}>
            <Text style={styles.nameAndPwd}>
              Username (NOT email!)
            </Text>
            <TextInput
              style={styles.textInput}
              returnKeyType={'next'}
              onChangeText={v => this.setState({ username: v, })}
              defaultValue={this.props.user.login}
              autoCapitalize={'none'}
              autoCorrect={false}
            />
            <Text style={styles.nameAndPwd}>
              Password
            </Text>
            <TextInput
              style={styles.textInput}
              returnKeyType={'done'}
              onSubmitEditing={this.login}
              onChangeText={v => this.setState({ password: v, })}
              secureTextEntry={true}
              defaultValue={this.state.password}
            />
            {tfaInput}
            <TouchableOpacity
              onPress={this.login}
              style={styles.confirm}
            >
              <View style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {signInContent}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {errDesc}
      </ScrollView>
    )
  }
}

LoginPage.propTypes = {}
LoginPage.defaultProps = {}

const select = state => {
  return {
    user: state.login.user
  }
}

export default connect(select)(LoginPage)

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  loginCard: {
    margin: 10,
    borderWidth: 1,
    borderColor: Colors.tintColor,
    borderRadius: 2,
    overflow: 'hidden'
  },

  up: {
    flexDirection: 'column',
    backgroundColor: Colors.tintColor,
    height: 38.0,
    borderRadius: 2,
    justifyContent: 'center',
  },

  introText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 18,
    alignSelf: 'flex-start',
    textAlign: 'left',
  },

  indicator: {
    position: 'absolute',
    right: 10,
    top: 10,
  },

  down: {
    margin: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  nameAndPwd: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'black',
  },

  textInput: {
    fontSize: 15,
    borderWidth: 1,
    height: 30,
    alignSelf: 'stretch',
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 4,
    padding: 3,
    borderColor: Colors.tintColor,
  },

  confirm: {
    flexDirection: 'column',
    backgroundColor: '#EFEFEF',
    borderWidth: 1,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 4,
    borderColor: Colors.tintColor,
    alignSelf: 'stretch'
  },

  errorPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },

  tfaStyle: {
    flexDirection: 'row',
  }
})