const React = require('react-native');
const Colors = require('../commonComponents/Colors');
const Configs = require('../config');
const CommonStyles = require('../commonComponents/CommonStyles');
const CommonComponents = require('../commonComponents/CommonComponents');
const GHService = require('../networkService/GithubServices')
const Platform = require('Platform');

const {
  StyleSheet,
  ActivityIndicatorIOS,
  View,
  Text,
  TouchableHighlight,
  TextInput,
  Image,
  ScrollView,
  ProgressBarAndroid,
} = React;

const WEBVIEWREF = 'webview';

const OnboardComponent = React.createClass({
  propTypes: {
    didOnboard: React.PropTypes.func,
  },

  getInitialState() {
    return {
      username: '',
      loadingError: null,
      loading: false,
    }
  },

  submitOnboard() {
    if (this.state.username.length == 0) return;

    this.setState({
      loadingError: null,
      loading: true,
    });
    GHService.onboard(this.state.username)
      .then(value => {
        this.setState({
          loading: false,
        })

        this.props.didOnboard && this.props.didOnboard(value);
      })
      .catch(err => {
        this.setState({
          loadingError: err,
          loading: false,
        });

        const needLogin = err.message.indexOf('rate') != -1;
        if (needLogin) {
          this.props.didOnboard && this.props.didOnboard(null, needLogin);
        }
      })
  },

  onNameChange(text) {
    this.setState({
      username: text,
    });
  },

  shouldComponentUpdate(nextProps, nextState) {
    const loginErr = nextState.loadingError != this.state.loadingError;
    const loading = nextState.loading != this.state.loading;

    return loginErr || loading;
  },

  render() {
    let failedDesc;
    if (this.state.loadingError) {
      failedDesc = (
        <Text
          style={{color: Colors.red}}>{this.state.loadingError.message}
        </Text>
      );
    }

    let loadingCp;
    let top = Platform.OS === 'android' ? 30 : 40;
    if (this.state.loading) {
      if (Platform.OS === 'android') {
        loadingCp = <ProgressBarAndroid styleAttr="Small"/>
      } else if (Platform.OS === 'ios') {
        loadingCp = <ActivityIndicatorIOS/>
      }
    }

    return (
      <ScrollView style={{backgroundColor: 'white'}}>
        <View style={[styles.container, {top: top}]}>
          <Image
            style={styles.welcomeImage}
            source={require('../AppIcons/ios/iTunesArtwork.png')}/>
          <View style={styles.loginContainer}>
            <TextInput
              autoCapitalize={'none'}
              autoCorrect={false}
              style={styles.textInput}
              returnKeyType={'done'}
              onChangeText={this.onNameChange}
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
          {loadingCp}
          {failedDesc}
        </View>
      </ScrollView>
    )
  },
});

const styles = StyleSheet.create({
  container: {
    top: 40,
    flexDirection: 'column',
    alignItems: 'center',
    height: 300,
    backgroundColor: 'white',
  },

  welcomeImage: {
    width: 150,
    height: 150,
    backgroundColor: Colors.backGray,
  },

  loginContainer: {
    flexDirection: 'row',
    margin: 30,
    height: 44,
    alignSelf: 'stretch',
    marginTop: 20,
  },

  textInput: {
    margin: 5,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.black,
    height: 30,
    alignSelf: 'stretch',
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 4,
    padding: 3,
    borderColor: Colors.borderColor,
    flex: 1,
  },

  go: {
    margin: 5,
    marginBottom: 10,
    flexDirection: 'column',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'stretch',
    borderRadius: 4,
    borderColor: Colors.borderColor,
  },

  nameAndPwd: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'black',
    width: 40,
  },
});

module.exports = OnboardComponent
