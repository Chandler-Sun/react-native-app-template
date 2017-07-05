import React, { Component } from 'react';
import I18n from 'react-native-i18n'
import { connect } from 'react-redux';
import {
  CameraRoll,
  Platform,
  View,
  Text,
  SectionList,
  Image,
  FlatList,
  Dimensions
} from 'react-native';
import { Container, Button, Left, Right } from 'native-base'
import _ from 'lodash';
import PhotoAccess from '../Services/PhotoAccess'

var {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');

const styles = {
  
}

class TestView extends Component {

    constructor(props) {
        super(props);
        this.state = {
          assets:[]
        }
    }
    componentWillMount() {
      this.init()
    }

    init(){
      // CameraRoll.getPhotos({
      //   first: 2000,
      //   assetType: 'Photos',
      // }).then((data)=>{
      //   let result = {
      //     includesLastAsset: !data.page_info.has_next_page,
      //     assets: data.edges
      //   }
      //   if (data.edges.length > 0) {
      //     lastCursor = data.page_info.end_cursor
      //   }
      //   this.setState(result);
      // })
      PhotoAccess.getScreenshots(0,2000,this._onPhotosChange.bind(this)).then((fetchResult)=>{
          let normalizedAssets = _.map(fetchResult.assets, PhotoAccess.getNormalizedAssetObj)
          this.setState({
            assets:normalizedAssets
          })
        })
    }

    _onPhotosChange(){

    }

    _renderItem(rowData){
      return this._renderImage(rowData.item.image, rowData.index, 0)
    }
    
    _renderImage(item, index, offset) {
      return (
        <Image key={item.uri} style={{
          width:deviceWidth/3,
          height:deviceWidth/3
        }} source={item}/>
      );
    }
    _getItemLayout(data, index){
      let ITEM_HEIGHT = deviceWidth/3
      return {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
    }
    render() {
      return (
        <Container>
          <View style={{flex:1}}>
            <FlatList 
              numColumns={3}
              data={this.state.assets}
              disableVirtualization={true}
              getItemLayout={this._getItemLayout.bind(this)}
              legacyImplementation={false}
              maxToRenderPerBatch={2000}
              removeClippedSubviews={false}
              renderItem={this._renderItem.bind(this)}
                />
          </View>
        </Container>
      )
    }
}

export default TestView