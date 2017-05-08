import { Image, StatusBar, Dimensions, AppState, Linking } from 'react-native'
import { Container, Content, Header, Footer, Left, Body, Right, View, Text, Tabs, Button, Icon,FooterTab } from 'native-base';
import Toast from 'react-native-root-toast';
import I18n from 'react-native-i18n'
import { connect } from 'react-redux';
import NavigationActions from '../State/Routes'
import React, { Component,PropTypes } from 'react';
import MixPanel from 'react-native-mixpanel'
import TrackEvent from '../Config/TrackEvent'
import PushNotification from '../Services/PushNotification'
import NetworkConfig from '../Config/NetworkConfig'

var {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');


const styles = {
}

class HomeView extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }

  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    Linking.addEventListener('url', this._handleOpenURL.bind(this));
    // this._setupNotification()
    this._handleInitialOpenURL()
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    Linking.removeEventListener('url', this._handleOpenURL.bind(this));
  }

  _setupNotification(){
    var that = this
    PushNotification.setup((n) => { that._handleReceivedNotification(n) }).then((deviceToken) => {
      that.props.requestDeviceTokenSuccess(deviceToken)
    }).catch((e) => console.tron.log(e))
  }
  _handleInitialOpenURL() {
    var that = this
    var url = Linking.getInitialURL().then((url) => {
      if (url) {
        that._loadResourcePage(url)
      }
    }).catch(err => console.tron.error('An error occurred', err));
  }

  _handleOpenURL(event) {
    //TODO
  }
  
  _handleReceivedNotification(notification){
    if (notification.foreground){
      //TODO
    } else if (notification.userInteraction){
      //TODO
    }
    this.props.didReceiveNotification(notification)
  }

  _handleAppStateChange = (appState) => {
    if (appState == 'active') {
      this._consumeNotification(this.props.lastNotification)
    }
  };

  _consumeNotification(notification){
    if (notification && notification.data && notification.data.url){
      //TODO
      this.props.didConsumeLastNotification()
    }
    PushNotification.setApplicationIconBadgeNumber(0)
  }
  
  render () {
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent>
                <Icon name='ios-more' />
            </Button>
          </Left>
          <Right>
            <Button transparent>
              <Text>{I18n.t('button.select')}</Text>
            </Button>
          </Right>
        </Header>
        
          <Content>
          </Content>

          <Footer>
            <FooterTab>
                <Button>
                    <Icon name="ios-crop-outline" />
                    <Text>Tab1</Text>
                </Button>
                <Button>
                    <Icon name="ios-albums-outline" />
                    <Text>Tab2</Text>
                </Button>
            </FooterTab>
          </Footer>
      </Container>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    lastNotification: state.userAuth.lastNotification
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    didReceiveNotification: (noti) => {
      dispatch(UserAuthActions.didReceiveNotification(noti))
    },
    didConsumeLastNotification: () => {
      dispatch(UserAuthActions.didConsumeLastNotification())
    },
    requestDeviceTokenSuccess: (tk) => {
      dispatch(UserAuthActions.requestDeviceTokenSuccess(tk))
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(HomeView)
