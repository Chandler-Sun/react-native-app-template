import React, { Component,PropTypes } from 'react';
import { AppState, Dimensions, Modal } from 'react-native'
import { StyleProvider, Container, Content, Footer, FooterTab, Button, Icon, Badge, Header, Title, Text, View, Tabs, Spinner } from 'native-base';
import I18n from 'react-native-i18n'
import renderIf from '../Utils/Visibility'
import NavigationRouter from './Navigation/NavigationRouter'
import { connect } from 'react-redux'
import StartupActions from '../State/Startup'
import StorePersist from '../Config/StorePersistConfig'
import ServiceConfig from '../Config/ServiceConfig'
import getTheme from './Themes/native-base-theme/components';
import RNShakeEvent from 'react-native-shake-event';
import { takeSnapshot, dirs } from 'react-native-view-shot'
import Mixpanel from 'react-native-mixpanel'
import NavigationActions, { ActionTypes as NavigationActionTypes} from '../State/Routes'
const uuid = require('react-native-uuid')

var {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');

class RootContainer extends Component {
  componentDidMount () {
    if(!StorePersist.enabled){//No persist storage enabled, should be start from new state.
      this.props.startup(this.props.token, this.props.user)
    }
    this.viewRef = null
    RNShakeEvent.addEventListener('shake', () => {
      this._takeSnapshotForFeedback()
    });
    AppState.addEventListener('change', this._handleAppStateChange);
    this._setupMixpanel();
  }

  componentWillUnmount() {
    RNShakeEvent.removeEventListener('shake');
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (appState) => {
    if (appState == 'active') {
      
    }
  };

  _setupMixpanel() {
    Mixpanel.sharedInstanceWithToken(ServiceConfig.MIXPANEL_TOKEN)
  }

  _takeSnapshotForFeedback() {
    if(!this.props.user||this.props.inFeedbackSession||this.props.uploading||this.props.working){
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
    let modalVisible = !!(this.props.uploading||this.props.working)
    return (
        <StyleProvider style={getTheme()}>
          <View style={{flex:1}}>
            <NavigationRouter ref={ref=>{this.viewRef = ref}}/>
            <Modal
                animationType={'none'}
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {}}
                >
                <View style={{
                  flex:1,
                  justifyContent: 'center',
                  }}>
                  <View style={{
                      borderRadius: 10,
                      padding:10,
                      backgroundColor:'#000',
                      alignSelf: 'center',
                    }}>
                    <Spinner style={{
                      width: 50,
                      height: 50,
                      alignSelf: 'center'
                    }} color="#ccc"/>
                    <Text style={{
                      color:"#fff",
                      fontSize:12,
                      textAlign:"center",
                      }}>{this._getSpinnerText()}</Text>
                  </View>
                </View>
              </Modal>
          </View>
        </StyleProvider>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    token: state.userAuth.token,
    user: state.userAuth.user
  }
}
const mapDispatchToProps = (dispatch) => ({
  startup: (token, user, options) => dispatch(StartupActions.startup(token, user, options))
})

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer)
