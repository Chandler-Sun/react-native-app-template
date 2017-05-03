import React, { Component } from 'react';
import I18n from 'react-native-i18n'
import {
  CameraRoll,
  Platform,
  StyleSheet,
  View,
  Text,
  ListView,
  ActivityIndicator
} from 'react-native';
import CameraRollItem from './CameraRollItem'
import RNPhotosFramework from 'react-native-photos-framework'

class CameraRollPicker extends Component {
  constructor(props) {
    super(props);
    this.shouldStopFetching = false
    this.state = {
      images: [],
      album: null,
      lastCursor: null,
      loadingMore: false,
      noMore: false,
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      })
    };
  }

  fetch() {
    if (!this.state.loadingMore && !this.shouldStopFetching) {
      this.setState({
        loadingMore: true
      }, () => {
        this._fetch();
      });
    }
  }

  componentWillMount() {
    RNPhotosFramework
      .requestAuthorization()
      .then((status) => {
        RNPhotosFramework.getAlbums({
          type:'smartAlbum',
          subType: 'smartAlbumUserLibrary',
          assetCount: 'estimated',
          includeMetadata: true,
          previewAssets: 2,
          assetFetchOptions: {
            includeHiddenAssets: true,
          }
        }, true)
      .then((albumsFetchResult) => {
        const album = albumsFetchResult.albums[0];
        this.setState({album})
        this.fetch();
      })
    })
  }

  componentWillUnmount() {
    this.shouldStopFetching=true
  }

  _fetch() {
    this.state.album.getAssets({
        includeMetadata: true,
        trackInsertsAndDeletes: true,
        includeResourcesMetadata:true,
      //  trackChanges: true,
        startIndex: this.state.images.length,
        endIndex: this.state.images.length + 20,
        fetchOptions: {
          //   includeHiddenAssets: true,
          mediaTypes: ['image'],
          sortDescriptors: [{
            key: 'creationDate',
            ascending: true
          }]
        },
        assetDisplayBottomUp: false,
        assetDisplayStartToEnd: false
      })
      .then((data) => {
        // console.log(data.assets.map(x => x.collectionIndex));
        this._appendImages(data);
      }, (e) => console.log(e));
  }

  _appendImages(data) {
    var assets = data.assets;
    var newState = {
      loadingMore: false
    };

    if (data.includesLastAsset) {
      newState.noMore = true;
    }

    if (assets.length > 0) {
      newState.images = this
        .state
        .images
        .concat(assets);
      newState.dataSource = this
        .state
        .dataSource
        .cloneWithRows(this._nEveryRow(newState.images, this.props.imagesPerRow));
    }

    this.setState(newState);
  }

  render() {
    var {dataSource} = this.state;
    var {
      scrollRenderAheadDistance,
      initialListSize,
      pageSize,
      removeClippedSubviews,
      imageMargin,
      backgroundColor,
      emptyText,
      emptyTextStyle
    } = this.props;

    var listViewOrEmptyText = dataSource.getRowCount() > 0
      ? (<ListView
        style={{
          flex: 1
        }}
        scrollRenderAheadDistance={scrollRenderAheadDistance}
        initialListSize={initialListSize}
        pageSize={pageSize}
        removeClippedSubviews={removeClippedSubviews}
        renderFooter={this
          ._renderFooterSpinner
          .bind(this)}
        onEndReached={this
          ._onEndReached
          .bind(this)}
        onEndReachedThreshold={1000}
        dataSource={dataSource}
        renderRow={rowData => this._renderRow(rowData)} />)
      : (
        <Text
          style={[
            {
              textAlign: 'center', color: 'white'
            },
            emptyTextStyle
          ]}>{emptyText}</Text>
      );

    return (
      <View
        style={[
          styles.wrapper, {
            padding: imageMargin,
            paddingRight: 0,
            backgroundColor: backgroundColor
          }
        ]}>
        {listViewOrEmptyText}
      </View>
    );
  }

  _renderImage(item) {
    var {imageMargin, imagesPerRow, containerWidth} = this.props;
    var uri = item.uri;

    return (<CameraRollItem
      key={uri}
      item={item}
      imageMargin={imageMargin}
      imagesPerRow={imagesPerRow}
      containerWidth={containerWidth}
      onClick={this
        ._selectImage
        .bind(this)} />);
  }

  _renderRow(rowData) {
    var items = rowData.map((item) => {
      if (item === null) {
        return null;
      }
      return this._renderImage(item);
    });

    return (
      <View style={styles.row}>
        {items}
      </View>
    );
  }

  _renderFooterSpinner() {
    if (!this.state.noMore) {
      return <ActivityIndicator style={styles.spinner} />;
    }
    return null;
  }

  _onEndReached() {
    if (!this.state.noMore) {
      this.fetch();
    }
  }

  _selectImage(asset) {
    var {maximum, imagesPerRow, callback} = this.props;
    // console.log("image uri:  " + asset.uri);

    // this.setState({
    //   dataSource: this
    //     .state
    //     .dataSource
    //     .cloneWithRows(this._nEveryRow(this.state.images, imagesPerRow))
    // });

    callback(asset);
  }

  _nEveryRow(data, n) {
    var result = [],
      temp = [];

    for (var i = 0; i < data.length; ++i) {
      if (i > 0 && i % n === 0) {
        result.push(temp);
        temp = [];
      }
      temp.push(data[i]);
    }

    if (temp.length > 0) {
      while (temp.length !== n) {
        temp.push(null);
      }
      result.push(temp);
    }

    return result;
  }

  _arrayObjectIndexOf(array, property, value) {
    return array.map((o) => {
      return o[property];
    }).indexOf(value);
  }

}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    flex: 1
  },
  spinner:{
    padding:5
  }
})

CameraRollPicker.propTypes = {
  scrollRenderAheadDistance: React.PropTypes.number,
  initialListSize: React.PropTypes.number,
  pageSize: React.PropTypes.number,
  removeClippedSubviews: React.PropTypes.bool,
  groupTypes: React
    .PropTypes
    .oneOf([
      'Album',
      'All',
      'Event',
      'Faces',
      'Library',
      'PhotoStream',
      'SavedPhotos'
    ]),
  maximum: React.PropTypes.number,
  assetType: React
    .PropTypes
    .oneOf(['Photos', 'Videos', 'All']),
  imagesPerRow: React.PropTypes.number,
  imageMargin: React.PropTypes.number,
  containerWidth: React.PropTypes.number,
  callback: React.PropTypes.func,
  backgroundColor: React.PropTypes.string,
  emptyText: React.PropTypes.string,
  emptyTextStyle: Text.propTypes.style
}

CameraRollPicker.defaultProps = {
  scrollRenderAheadDistance: 800,
  initialListSize: 1,
  pageSize: 12,
  removeClippedSubviews: true,
  groupTypes: 'SavedPhotos',
  maximum: 15,
  imagesPerRow: 3,
  imageMargin: 5,
  assetType: 'Photos',
  backgroundColor: 'white',
  callback: function (image) {
    // console.log(image);
  },
  emptyText: I18n.t('No photos')
}

export default CameraRollPicker;
