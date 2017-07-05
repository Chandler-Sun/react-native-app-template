import React, { Component,PropTypes } from 'react';
import { AppState, Dimensions, Modal,NetInfo,Platform,Linking,LayoutAnimation } from 'react-native'
import { StyleProvider, Container, Content, Footer, FooterTab, Button, Icon, Badge, Header, Title, Text, View, Tabs, Spinner } from 'native-base';
import I18n from 'react-native-i18n'
import renderIf from '../Utils/Visibility'
import NavigationRouter from './Navigation/NavigationRouter'
import { connect } from 'react-redux'
import AppActions from '../State/App'
import StorePersist from '../Config/StorePersistConfig'
import ServiceConfig from '../Config/ServiceConfig'
import getTheme from './Themes/native-base-theme/components';
import { takeSnapshot, dirs } from 'react-native-view-shot'
import Mixpanel from 'react-native-mixpanel'
import NavigationActions, { ActionTypes as NavigationActionTypes} from '../State/Routes'
import LoadingView from './LoadingView'
import {KEY_ENABLE_SNAP_NOTIFICATION} from '../Config/UserSettings'
import BackgroundTimer from 'react-native-background-timer'
import { addNavigationHelpers } from 'react-navigation';
import PushNotification from '../Services/PushNotification'

const uuid = require('react-native-uuid')

class RootContainer extends Component {
  constructor(props) {
    super(props);
    this._backgroundTimerForDetection = null
    this._geoWatchId = null
    this.state = {
      navigation: addNavigationHelpers({
        dispatch: props.dispatch,
        state: props.nav,
      })
    }
  }
  componentWillReceiveProps(nextProps){
    this.setState({
      navigation: addNavigationHelpers({
        dispatch: nextProps.dispatch,
        state: nextProps.nav,
      })
    })
  }
  componentDidMount () {
    if(!StorePersist.enabled){//No persist storage enabled, should be start from new state.
      this.props.startup(this.props.token, this.props.user)
    }
    this.viewRef = null
    AppState.addEventListener('change', this._handleAppStateChange);
    Linking.addEventListener('url', this._handleOpenURL.bind(this));
    this._setupMixpanel();
    this._setupNetworkDetector()
    // this._setupBackgroundDetection()
    // this._setupNotification()
    this._handleInitialOpenURL()
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    // BackgroundTimer.clearInterval(this._backgroundTimerForDetection);    
    Linking.removeEventListener('url', this._handleOpenURL.bind(this));
    // PushNotification.unload()
    // this._geoWatchId != null && navigator.geolocation.clearWatch(this._geoWatchId)
  }

  _setupNotification(){
    var that = this
    PushNotification.prepare(this._handleInteractiveAction.bind(this))
    PushNotification.setup((n) => { that._handleReceivedNotification(n) }).then((deviceToken) => {
      that.props.requestDeviceTokenSuccess(deviceToken)
    }).catch((e) => console.tron.log(e))
    PushNotification.setApplicationIconBadgeNumber(0)
  }

  _handleInteractiveAction(action){
    let notification = action.notification
    let {key} = notification.getData()
    if(key){
      key = key.replace(/\//g,'_') //escape path separator '/'
      this._handleOpenURL({url:`${action.identifier}/${key}`})
    }
  }

  _handleReceivedNotification(notification){
    this.props.didReceiveNotification(notification)
    if (notification.foreground && notification.data && notification.data.url){
      LayoutAnimation.easeInEaseOut()
    } else if (notification.userInteraction){
      this._consumeNotification(notification)
    }
  }

  _clearNotification(){
    LayoutAnimation.easeInEaseOut()
    this.props.didConsumeLastNotification()
  }

  _consumeNotification(notification){
    if (notification && notification.data){
      if(notification.data.key){
        let key = notification.data.key.replace(/\//g,'_') //escape path separator '/'
        this._handleOpenURL({url:`instashot://singleImage/view/${key}`})
      }else if(notification.data.url){
        this._clearNotification()
        this.state.navigation.navigate('webview', {...notification.data})
      }
    }
    PushNotification.setApplicationIconBadgeNumber(0)
  }


  _handleInitialOpenURL() {
    var that = this
    var url = Linking.getInitialURL().then((url) => {
      if (url) {
        this._handleOpenURL({url})
      }
    }).catch(err => console.tron.error('An error occurred', err));
  }

  _handleOpenURL({url}) {
    console.tron.log(url)
    const [schema, path] = url.split('://')
    if(path){
      const [category, action, param] = path.split('/')
      if(category == 'singleImage'){
        //action: view|scan|addTo|share
        let key = param.replace(/\_/g, '/')
        this.state.navigation.navigate('singleImage', {
          action: action,
          key
        })
      }
    }
  }

  async _setupNetworkDetector(){
    let reach = await NetInfo.fetch()
    console.tron.log('Initial: ' + reach)
    NetInfo.addEventListener(
      'change',
      this._handleConnectivityChange.bind(this)
    )
  }
  _setupBackgroundDetection(){
    let enableSnapDetection = _.get(this.props.settings, KEY_ENABLE_SNAP_NOTIFICATION, true)
    if(enableSnapDetection){
      this._backgroundTimerForDetection = BackgroundTimer.setInterval(() => {
        //NOOP
      }, 1000);
      //test
      navigator.geolocation.getCurrentPosition(
        (position) => {
          //NOOP
        },
        (error) => console.tron.inspect({error})
      );
      this._geoWatchId = navigator.geolocation.watchPosition((position) => {
        //NOOP
      });
    }
  }

  _handleConnectivityChange(reach) {
    console.tron.log('change: ' + reach)
    this.props.connectivityChanged(reach)
  }

  _handleAppStateChange = (appState) => {
    if (appState == 'active') {

    }
  };

  _setupMixpanel() {
    Mixpanel.sharedInstanceWithToken(ServiceConfig.MIXPANEL_TOKEN)
  }

  _takeSnapshotForFeedback() {
    if(this.props.inFeedbackSession||this.props.uploading||this.props.working){
      return
    }
    var that = this
    let fileName = uuid.v1() + '.jpg'
    takeSnapshot(this.viewRef, {
      format: "jpeg",
      quality: 0.5,
      path: dirs.CacheDir + '/' + fileName
    })
    .then(
      uri => {
        console.tron.display({name:"Image saved", value: {uri:uri}})
        // TODO:
        // NavigationActions.feedbackView()
      },
      error => console.tron.log("Oops, snapshot failed" + error)
    );
  }

  _getSpinnerText(){
    if(this.props.uploading){
      return I18n.t("Uploading")
    }
    if(this.props.working){
      return I18n.t("Processing")
    }
    return "Processing"
  }

  render () {
    if(this.props.started){
      return (
          <StyleProvider style={getTheme()}>
            <NavigationRouter ref={ref=>{this.viewRef = ref}} navigation={this.state.navigation}/>
          </StyleProvider>
      )
    }else{
      return (
        <LoadingView></LoadingView>
      )
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    started: state.app.started,
    nav: state.nav,
    settings: state.app.settings,
  }
}
const mapDispatchToProps = (dispatch) => ({
  dispatch: dispatch,
  startup: (token, user) => dispatch(AppActions.startup(token, user)),
  connectivityChanged: (networkReach) => dispatch(AppActions.connectivityChanged(networkReach)),
  didReceiveNotification: (noti) => {
    dispatch(AppActions.didReceiveNotification(noti))
  },
  didConsumeLastNotification: () => {
    dispatch(AppActions.didConsumeLastNotification())
  },
  requestDeviceTokenSuccess: (tk) => {
    dispatch(AppActions.requestDeviceTokenSuccess(tk))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer)
