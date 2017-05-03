import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Image, Alert, View, Dimensions, Linking, Modal} from 'react-native'
import { Container, Content, List, ListItem, Input, Icon, Text, Label, Button, Form, Item, Footer, Header, Left, Body,Title, Right } from 'native-base'
import I18n from 'react-native-i18n'
import DeviceInfo from 'react-native-device-info'
import ModalBox from 'react-native-modalbox'
import MixPanel from 'react-native-mixpanel'
import TrackEvent from '../Config/TrackEvent'
import NavigationActions from '../State/Routes'
import UserAuthActions from '../State/UserAuth'
import NetworkConfig from '../Config/NetworkConfig'
import AppConfig from '../Config/AppConfig'

import renderIf from '../Utils/Visibility'

var {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');

const styles = {
  
}

class SettingView extends Component {

    constructor(props) {
        super(props);

        this.state = {}
    }

    componentWillReceiveProps(newProps) {
      // if(newProps.error && !newProps.fetching){
      //     Alert.alert(
      //       'Oops',
      //       newProps.error,
      //     )
      // }
    }
    render() {
      return (
        <Container>
           <Header>
              
          </Header>
          <Content>
          </Content>
        </Container>
      )
    }
}

const mapStateToProps = (state, ownProps) => {
  return {}
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingView)
