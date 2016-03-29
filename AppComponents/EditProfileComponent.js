const React = require('react-native');
const GHService = require('../networkService/GithubServices')
const Icon = require('react-native-vector-icons/Ionicons');
const Colors = require('../commonComponents/Colors');
const RCTUIManager = require('NativeModules').UIManager;

const {
  TextInput,
  Image,
  View,
  StyleSheet,
  Text,
  ActivityIndicatorIOS,
  TouchableHighlight,
  ScrollView,
  LayoutAnimation,
  PickerIOS,
  Switch,
  Alert,
  Dimensions,
  DeviceEventEmitter
} = React;

const PickerItemIOS = PickerIOS.Item;
const ICON_SIZE = 27;
const AVATAR_SIZE = 60;
const INPUTFIELD_HEIGHT = 40;

const NOT_HIREABLE_NOTE = 'No, I\'m not hireable!';
const HIREABLE_NOTE = 'Yes, I\'m hireable!';
const DEFAULT_EMAIL_ADDRESS = 'Don\'t show my email address';

const EditProfileComponent = React.createClass({

  //Input fields configurations.
  _inputFieldConfig:[],
  _currentFocusedInputFieldId:'',
  _isKeyboardOpen:true,

  getInitialState() {
    return {
      name:'Name',
      email:'Email',
      blog:'Blog',
      company:'Company',
      location:'Location',
      //'hireable' is original bool but use stirng to ficilitate management.
      hireable:NOT_HIREABLE_NOTE,
      bio:'Biography',
      doneLoading:false,
      isKeyboardOpen:true,
    };
  },

  componentWillMount() {
    this._inputFieldConfig = [
      {
        id:'name',//Field id == State name.
        placeholder:'Name',
        iconName:'ios-person',
        didChange:false,//Indicating whether the field has changed.
      },
      {
        id:'location',
        placeholder:'Location',
        iconName:'ios-location',
        didChange:false,
      },
      {
        id:'email',
        placeholder:'Add or select pulibc email address',
        iconName:'ios-email',
        //Email list data.
        emailList:[{
          //Default.
          email:DEFAULT_EMAIL_ADDRESS,
        }],
        didChange:false,
      },
      {
        id:'blog',
        placeholder:'Bolg',
        iconName:'social-rss',
        didChange:false,
      },
      {
        id:'company',
        placeholder:'Company',
        iconName:'ios-people',
        didChange:false,
      },
      {
        id:'bio',
        placeholder:'Biography',
        iconName:'information-circled',
        didChange:false,
      },
      {
        id:'hireable',
        placeholder:'Hireable',
        iconName:'ios-wineglass',
        didChange:false,
      },
    ];

    //Redefine callbacks of right&left buttons on Navigator.
    this.props.route.pressSave = this.onPressSave;
    this.props.route.pressCancel = this.onPressCancel;
  },

  componentDidMount(){
    let userInfo_url = GHService.apiPath() + '/user';
    let userEmail_url = GHService.apiPath() + '/user/emails';

    //Get email list.
    GHService.fetchPromise(userEmail_url)
    .then(response => {
      let body = response._bodyInit;
      let emailList = JSON.parse(body);
      for (var i = 0; i < this._inputFieldConfig.length; i++) {
        if (this._inputFieldConfig[i].id == 'email') {
          emailList.map((item) => {
            //Save email list.
            this._inputFieldConfig[i].emailList.push(item);
          })
          break;
        }
      }

      //Get user info.
      return GHService.fetchPromise(userInfo_url);
    })
    .then(response => {
      let body = response._bodyInit;
      let user = JSON.parse(body);
      this.setState({
        name:user.name,
        email:user.email,
        blog:user.blog,
        company:user.company,
        location:user.location,
        hireable:user.hireable?HIREABLE_NOTE:NOT_HIREABLE_NOTE,
        bio:user.bio,
        doneLoading:true,
      });
    })
    .catch(err => {
      console.log(err);
    });

    DeviceEventEmitter.addListener('keyboardWillShow', this.keyboardWillShow);
    DeviceEventEmitter.addListener('keyboardWillHide', this.keyboardWillHide);
  },

  // componentWillUnmount() {
  //   DeviceEventEmitter.removeListener('keyboardWillShow');
  //   DeviceEventEmitter.removeListener('keyboardWillHide');
  // },

//-------Functions of buttons on navigationBar---------
  onPressSave(){
    this.setState({doneLoading:false});

    let update_url = GHService.apiPath() + '/user';
    let addEmail_url = GHService.apiPath() + '/user/emails';

    //Add email.
    fetch(addEmail_url,{
      method:'POST',
      headers:GHService.tokenHeader(),
      body:JSON.stringify([
        this.state.email,
      ])
    })
    .then(()=>{
      let hireable = this.state.hireable == HIREABLE_NOTE?true:false;
      fetch(update_url,{
        method:'PATCH',
        headers:GHService.tokenHeader(),
        body:JSON.stringify({
          'name':this.state.name,
          'email':this.state.email,//Set public email.
          'blog':this.state.blog,
          'company':this.state.company,
          'location':this.state.location,
          'hireable':hireable,
          'bio':this.state.bio,
        }),
      })
    })
    .then(() => {
      console.log('EditProfileComponent::onPressSave succeed');
    }).catch((err) => {
      console.log('EditProfileComponent::onPressSave fail');
    }).done(()=>{
      this.props.navigator.pop();
    });
  },

  onPressCancel() {
    if (this.checkNeedUpdate()) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to cancel?',
        [
          {text: 'OK', onPress: () => this.props.navigator.pop()},
          {text: 'Cancel', style:'cancel'},
        ]
      );
    }else {
      this.props.navigator.pop();
    }
  },
//-----------------------------------------------------

//---------------Keyboard Event Listener---------------
  keyboardWillShow(e) {
    let component = this.refs[this._currentFocusedInputFieldId];
    if (component === undefined) {return;}

    //Get the position of focused input field.
    RCTUIManager.measure(
      React.findNodeHandle(component),
      (fx, fy, width, height, px, py) => {
      let newSize = Dimensions.get('window').height-e.endCoordinates.height-fy-INPUTFIELD_HEIGHT;
      //If keyboard isn't open or open but won't block the input field, don't
      //scroll.
      if (this._isKeyboardOpen && newSize < 0) {
        this._isKeyboardOpen = false;
        this.refs.scrollView.scrollTo(-newSize,0,true);
      }
    });
  },

  keyboardWillHide(e) {
    this._isKeyboardOpen = true;
  },
//-----------------------------------------------------

//----Input field's call back and utilities mehtod-----
  //Call when input is focused.
  onFocusCallback(id) {
    this._currentFocusedInputFieldId = id;
  },

  //Call when press return.
  onSubmitEditing() {
    this.refs.scrollView.scrollTo(0,0,true);
  },

  //Call when input text changes.
  //needUPdate:true indicates field needs update.
  diffCallback(needUPdate, id, value) {
    this.setState({[id]:value,});
    this.markNeedUpdate(id,needUPdate);
  },

  //To check if there are changed fields.
  //Return true: there are changed fields.Need update.
  checkNeedUpdate() {
    return this._inputFieldConfig.some(element => {
      return element.didChange;
    });
  },

  //To mark field's as changed or unchanged.
  markNeedUpdate(id,changed) {
    for (let i = 0; i < this._inputFieldConfig.length; i++) {
      if (this._inputFieldConfig[i].id == id) {
        this._inputFieldConfig[i].didChange = changed;
        break;
      }
    }
  },
//-----------------------------------------------------

//-----------------render------------------------------
  //Render input fields with ids.
  //values:[id1,id2,id3...],id:string.
  filterAndRenderInputField(values) {
    let configs = this._inputFieldConfig.filter((cog) => {
      return values.includes(cog.id);
    });
    return configs.map(this.renderInputField);
  },

  renderInputField(config, index){
    return (
      <InputField
        key={'config_' + index}
        ref={config.id}
        config={config}
        diffCallback={this.diffCallback}
        originValue={this.state[config.id]==null?'':this.state[config.id]}
        onFocusCallback={this.onFocusCallback}
        onSubmitEditing={this.onSubmitEditing}/>
    );
  },

  render(){
    let avatarURL = GHService.currentUser().avatar;
    let upperInputFieldIDs = ['name','location'];
    let lowerInputFieldIDs = ['email','blog','company','bio','hireable'];
    if (this.state.doneLoading) {
      return (
        <ScrollView
        ref='scrollView'
        style={styles.container}
        keyboardDismissMode={'on-drag'}
        keyboardShouldPersistTaps={true}>
          <View style={[styles.breakLine,{marginLeft:0,marginTop:100}]}/>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <View style={{flex:1}}>
              {this.filterAndRenderInputField(upperInputFieldIDs)}
            </View>
            <Image
              source={{uri:avatarURL}}
              style={
                [styles.avatar,{borderColor:
                this.state.hireable==HIREABLE_NOTE?Colors.green:'#F5B300'}]}/>
          </View>
          <View style={[styles.breakLine,{marginLeft:50}]}/>
            {this.filterAndRenderInputField(lowerInputFieldIDs)}
          <View style={[styles.breakLine,{marginLeft:0}]}/>
        </ScrollView>
      );
    } else {
      return (
        <View style={styles.acitvityIndicatorContainer}>
          <ActivityIndicatorIOS animating={true} size='large'/>
        </View>
      );
    }
  },
});

const InputField = React.createClass({

  propTypes:{
    //Input field configuration used for setting up.
    config:React.PropTypes.object,
    //Call when input text changes.
    diffCallback:React.PropTypes.func,
    //Keep the original value for diff checking.
    originValue:React.PropTypes.string,
    //Call when inputField is focused.
    onFocusCallback:React.PropTypes.func,
    //Call when press return.
    onSubmitEditing:React.PropTypes.func,
  },

  getInitialState() {
    return {
      //The text of input field.
      value:this.props.originValue,
      //Used for display email list.
      emaliListViewHeight:0,
      //Email list open state.
      isOpenEmailList:false,
    };
  },

  componentDidMount() {
    LayoutAnimation.spring();
  },

  //Call when input field's value has changed.
  textDidChange(text) {
    if (this.props.config.id == 'hireable') {
      //'text' is bool if this is hireable input field.
      text = text?HIREABLE_NOTE:NOT_HIREABLE_NOTE;
    }
    this.setState({value:text,});
    if(this.state.value != this.props.originValue) {
      //The text has changed. Update the state.
      this.props.diffCallback(true,this.props.config.id,text);
    }else {
      //The text reamins the same. Mark the field's state as unchaged.
      this.props.diffCallback(false,this.props.config.id,this.props.originValue);
    }
  },

  //Call to display email list by animation.
  switchEmailList() {
    if (this.props.config.emailList.length > 1) {
      LayoutAnimation.spring();
      this.setState({
        isOpenEmailList:!this.state.isOpenEmailList,
        emaliListViewHeight:!this.state.isOpenEmailList?216:0,
        //The status is not refreshed yet. 'isOpenEmailList' is still 'false'
        //after executing previous line of code.
      });
    }else {
      Alert.alert('Notice!',"You haven't set any email address. Please input a preferred one and save.")
    }
  },

  render() {
    let config = this.props.config;
    let breakLine = (<View style={[styles.breakLine,{marginLeft:50}]}/>);
    let editable = true;
    let moreEmailBtn,emailList,emailValidationCheck,bioView;

    switch (config.id) {
      case 'location': {
        breakLine = null;
        break;
      }
      case 'email': {
        moreEmailBtn = (
          <TouchableHighlight
            onPress={()=>{
              this.switchEmailList();
            }}>
          <Icon
            name={'ios-more'}
            size={ICON_SIZE}
            style={styles.iconStyle}
            color={Colors.textGray}/>
          </TouchableHighlight>
        );

        let pickerPart = null;
        if (this.state.isOpenEmailList) {
          pickerPart = (
            <PickerIOS
              selectedValue={this.state.value}
              onValueChange={value =>
                this.textDidChange(value==DEFAULT_EMAIL_ADDRESS?'':value)
              }>
              {config.emailList.map((obj,index) => {
                return (<PickerItemIOS
                  key={obj.email + '_' + index}
                  label={obj.email}
                  value={obj.email}
                />);
              })}
            </PickerIOS>
          );
        }

        emailList = (
          <View style={{height:this.state.emaliListViewHeight}}>
            {pickerPart}
          </View>
        );

        //Call when input field is done editing.
        emailValidationCheck = () => {
          let re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
          if(this.state.value != '' && !re.test(this.state.value)) {
            this.setState({
              value:'',
            });
            Alert.alert('Invalid Input','Pleas try again!')
          }
        };
        break;
      }
      case 'hireable': {
        bioView = (
          <Switch
            onValueChange={(value) => {
              this.textDidChange(value);
            }}
            value={this.state.value==HIREABLE_NOTE?true:false}/>
        );
        editable = false;
        breakLine = null;
        break;
      }
      default:
        break;
    }

    return (
      <View style={styles.container}>
        <View style={styles.inputFieldContainer}>
          <Icon
            name={config.iconName}
            size={ICON_SIZE}
            style={styles.iconStyle}
            color={Colors.textGray}/>
          <TextInput
            style={styles.InputField}
            onChangeText={this.textDidChange}
            onFocus={() => this.props.onFocusCallback(this.props.config.id)}
            onEndEditing={emailValidationCheck}
            onSubmitEditing={this.props.onSubmitEditing}
            returnKeyType={'done'}
            maxLength={200}
            placeholder={config.placeholder}
            value={this.state.value}
            editable={editable}
            clearButtonMode={'while-editing'}/>
          {moreEmailBtn}
          {bioView}
        </View>
        {emailList}
        {breakLine}
      </View>
    );
  }

});

const styles = StyleSheet.create({
  container:{
    flex:1,
  },
  inputFieldContainer:{
    flexDirection:'row',
    alignItems:'center',
    height:INPUTFIELD_HEIGHT,
    marginTop:1,
    marginBottom:1,
    backgroundColor:'white'
  },
  InputField:{
    flex:1,
    fontSize:15,
  },
  iconStyle:{
    height:ICON_SIZE,
    width:ICON_SIZE,
    margin:10,
  },
  avatar: {
    backgroundColor: 'lightGray',
    borderRadius: AVATAR_SIZE/2,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: 'center',
    borderWidth: 3,
    marginLeft:15,
    marginRight:15,
  },
  acitvityIndicatorContainer: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakLine: {
    height:1,
    backgroundColor:'lightGray',
  },
});

module.exports = EditProfileComponent;
