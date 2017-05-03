import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Image, Dimensions } from 'react-native'
import { Container, Content, Button, H1, Text, Header, Icon, Title } from 'native-base'
import I18n from 'react-native-i18n'
import { Col, Row, Grid } from 'react-native-easy-grid';
import NavigationActions from '../State/Routes'

var {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');

const styles = {
  row:{
    justifyContent:'center',
    alignItems:'center'
  }
}

class SplashView extends Component {

    constructor(props) {
      super(props);
    }

    _getStarted(){
      NavigationActions.homeView()
    }

    render() {
      return (
        <Container>
          <Grid>
            <Row style={{...styles.row, flex:3}}>
              <H1>Tutorial</H1>
            </Row>
            <Row style={{...styles.row, flex:1}}>
              <Button onPress={()=>this._getStarted()}><Text>Get started</Text></Button>
            </Row>
          </Grid>
        </Container>
      )
    }
}

export default SplashView
