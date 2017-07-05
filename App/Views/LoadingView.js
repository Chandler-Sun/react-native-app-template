import React, { Component } from 'react';
import I18n from 'react-native-i18n'
import { connect } from 'react-redux';
import {
  CameraRoll,
  Platform,
  SectionList,
  Image,
  FlatList,
  Dimensions
} from 'react-native';
import { StyleProvider, Container, Content, Footer, FooterTab, Button, Icon, Badge, Header, Title, Text, View, Tabs, Spinner } from 'native-base';
import _ from 'lodash';
import PhotoAccess from '../Services/PhotoAccess'

var {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');

const styles = {
  
}

class LoadingView extends Component {
    render() {
      return (
        <Container>
          <Header></Header>
          <Content></Content>
          <Footer></Footer>
        </Container>
      )
    }
}

export default LoadingView