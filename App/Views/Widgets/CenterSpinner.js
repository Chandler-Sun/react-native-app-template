import React, { Component, PropTypes } from 'react';
import {View}  from 'react-native'
import {Spinner, Text} from 'native-base'
import renderIf from '../../Utils/Visibility'

export default class CenterSpinner extends React.Component {

  render(){
    const {workingJobName, workingStatus, backgroundColor} = this.props
    return (
      <View style={{
        flex:1,
        justifyContent: 'center',
        backgroundColor:'rgba(0,0,0,0.4)',        
        }}>
        <View style={{
            borderRadius: 10,
            padding:20,
            backgroundColor:backgroundColor||'#fff',
            alignSelf: 'center',
            width:270,
          }}>
          <Spinner 
          style={{ 
            width: 50,
            height: 50,
            alignSelf: 'center'
          }} color="#000"/>
          {renderIf(workingJobName)(
            <Text style={{
              color:"#000",
              fontSize:17,
              fontWeight:'bold',
              textAlign:"center",
              }}>{workingJobName}</Text>
          )}
          {renderIf(workingStatus)(
            <Text style={{
            color:"#000",
            fontSize:13,
            marginTop:4,
            textAlign:"center",
            }}>{workingStatus}</Text>
          )}
        </View>
      </View>
    )
  }
}