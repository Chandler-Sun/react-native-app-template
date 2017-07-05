import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  View,
  Animated,
  findNodeHandle
} from 'react-native';
const RCTUIManager = require('NativeModules').UIManager;
import {Icon} from 'native-base'
import renderIf from '../../Utils/Visibility'
import variable from '../Themes/native-base-theme/variables/platform';
import DynamicImage from './DynamicImage';
import moment from 'moment-timezone'
import I18n from 'react-native-i18n'


const ANIM_CONFIG = { duration: 300 };

const AnimatedDynamicImageView = Animated.createAnimatedComponent(DynamicImage);

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

class CameraRollItem extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      videoPaused: true,
      origin: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      target: {
        x: 0,
        y: 0,
        opacity: 1,
      }, 
      fullscreen:false,
      animating: false,
      expandAnim: new Animated.Value(0),
     };
  }

  componentWillMount() {
    var {width} = Dimensions.get('window');
    var {imageMargin, imagesPerRow, containerWidth} = this.props;

    if (typeof containerWidth != "undefined") {
      width = containerWidth;
    }
    this._imageSize = (width - (imagesPerRow + 1) * imageMargin) / imagesPerRow;
  }

  toogleVideoPlay() {
    this.setState({
      videoPaused : !this.state.videoPaused
    });
  }

  renderVideo() {
    /*if (this.props.item.mediaType !== 'video' || this.state.videoPaused) {
      return null;
    }
    return (
      <Video source={this.props.item.video}   // Can be a URL or a local file.
        ref={(ref) => {
          this.player = ref
        }}
        resizeMode='cover'
        onPlaybackRateChange={() => { } }                             // Store reference
        rate={1.0}                     // 0 is paused, 1 is normal.
        volume={1.0}                   // 0 is muted, 1 is normal.
        muted={false}                  // Mutes the audio entirely.
        paused={this.state.videoPaused}                 // Pauses playback entirely.
        repeat={true}                  // Repeat forever.
        playInBackground={false}       // Audio continues to play when app entering background.
        playWhenInactive={false}       // [iOS] Video continues to play when control or notification center are shown.
        progressUpdateInterval={250.0} // [iOS] Interval to fire onProgress (default to ~250ms)
        style={styles.thumbVideo} />
    );*/
  }

  renderVideoSymbol() {
    if (this.props.item.mediaType !== 'video') {
      return null;
    }
    return (
      <TouchableOpacity style={styles.playButtonContainer} onPress={this.toogleVideoPlay.bind(this)}>
        <Text style={[styles.playButton, !this.state.videoPaused ? styles.paused : styles.playing]}>{!this.state.videoPaused ? '▐▐' : '►'}</Text>
      </TouchableOpacity>
    );
  }

  _getImageStyle(image){
    const inputRange = [0, 1]
    const {
      fullscreen, expandAnim, origin, target,
    } = this.state;
    if (!fullscreen){
      return {
        height: this._imageSize, 
        width: this._imageSize
      }
    }
    return {
      left: expandAnim.interpolate({
        inputRange, outputRange: [origin.x, target.x],
      }),
      top: expandAnim.interpolate({
        inputRange, outputRange: [origin.y, target.y],
      }),
      width: expandAnim.interpolate({
        inputRange, outputRange: [origin.width, screenWidth],
      }),
      height: expandAnim.interpolate({
        inputRange, outputRange: [origin.height, screenHeight],
      }),
    }
      
  }

  animatedToFullScreen(onComplete){
    this.setState({ fullscreen: true });
    RCTUIManager.measure(findNodeHandle(this.refs.imageNode), (fx, fy, width, height, x, y) => {
       this.setState({
        animating: true,
        origin: { x, y, width, height },
        target: { x: 0, y: 0},
      })
      Animated.spring(this.state.expandAnim, {
        ...ANIM_CONFIG,
        toValue: 1,
      }).start(() => {
        this.setState({ animating: false });
        onComplete && onComplete();
      })
    })
  }

  shouldComponentUpdate(nextProps, nextState){
    if(
      nextProps.selected!=this.props.selected 
      || nextProps.index!=this.props.index
      || !nextProps.selectionMode && this.props.selectionMode && this.props.selected//cancel all
      || nextProps.item.image.uri != this.props.item.image.uri
      ){
      return true
    }
    return false
  }

  render() {
    var {item, selectionMode, imageMargin} = this.props;

    var image = item.image;
    if(item.deleted){
      var deleteDate = moment(item.deletedAt*1000);
      var now = new Date();
      var nowDate = moment(now);
      var dayLeft = 60-nowDate.diff(deleteDate,'days');
    }
    let size = {
      height: this._imageSize, 
      width: this._imageSize
    }
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={{ marginBottom: imageMargin, marginRight: imageMargin, position:'relative' }}
        onPress={() => this._handleClick(item)}>
        <AnimatedDynamicImageView
          source={image}
          ref="imageNode"
          style={{ ...this._getImageStyle(), backgroundColor:'#eee' }} >
        </AnimatedDynamicImageView>
        {renderIf(item.deleted && !(selectionMode && this.props.selected))(
          <View style={{
            ...size,
            ...styles.countDownMask
            }}>
            <Image style={styles.countDownMaskImage} source={require('../../Images/count_down_mask.png')}>
              <Text style={styles.countDownMaskText}>{I18n.t('dialog.deleteCountDown',{count:dayLeft})}</Text>
            </Image>
          </View>
        )}
        {renderIf(selectionMode && this.props.selected)(
          <View style={{
            ...size,
            ...styles.mask
            }}>
            {renderIf(item.deleted)(
              <View style={{
              ...size,
              ...styles.countDownMask
              }}>
                <Image style={styles.countDownMaskImage} source={require('../../Images/count_down_mask.png')}>
                  <Text style={styles.countDownMaskText}>{I18n.t('dialog.deleteCountDown',{count:dayLeft})}</Text>
                </Image>
              </View>
            )}
            <Image style={styles.selectionCheck} source={require('../../Images/small-selected-on.png')}/>
          </View>
        )}
        {/*{renderIf(selectionMode && !this.props.selected)(
          <Image style={styles.selectionCheck} source={require('../../Images/small-selected-off.png')}/>
        )}*/}
        {this.props.displayDates ? (<View style={styles.dates}><Text style={styles.creationText}>{`Created: ${item.creationDate.toDateString()}`}</Text>
          <Text style={styles.modificationText}>{`Modified: ${item.modificationDate.toDateString()}`}</Text></View>
        ) : null}
        {this.renderVideo()}
        {this.renderVideoSymbol()}
      </TouchableOpacity>
    );
  }

  _handleClick(item) {
    let selected = !this.props.selected
    this.props.onClick(item, selected, this)
  }
}

const styles = {
  creationText: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    padding: 3,
    fontSize: 10
  },
  modificationText: {
    position: 'absolute',
    top: 35,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    padding: 3,
    fontSize: 10
  },
  dates: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  playButtonContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white'
  },
  playButton: {
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 18,
    fontFamily: 'Arial',
    left: 2
  },
  paused : {
    fontSize: 12,
    left: -2
  },
  playing : {

  },
  thumbVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor : 'transparent'
  },
  selectionCheck:{
    right:0,
    bottom:0,
    position:'absolute'
  },
  countDownMask:{
    flex:1, 
    position: 'absolute',
    justifyContent:'flex-end'
  },
  mask:{
    flex:1,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',  
  },
  countDownMaskImage:{
    height:32,
    width:this._imageSize,
  },
  countDownMaskText:{
    color:'white',
    top:10,
    backgroundColor:'transparent',
    alignSelf:'flex-end',
    right:4,
    bottom:4
  }
}

CameraRollItem.defaultProps = {
  item: {},
  selected: false,
}

CameraRollItem.propTypes = {
  item: React.PropTypes.object,
  selected: React.PropTypes.bool,
  imageMargin: React.PropTypes.number,
  imagesPerRow: React.PropTypes.number,
  index: React.PropTypes.number,
  onClick: React.PropTypes.func,
}

export default CameraRollItem;
