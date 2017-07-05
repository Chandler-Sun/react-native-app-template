import _ from 'lodash'
import { I18nManager } from 'react-native';

/**
 * Render the initial style when the initial layout isn't measured yet.
 */
function forInitial(props) {
  const { navigation, scene } = props;

  const focused = navigation.state.index === scene.index;
  const opacity = focused ? 1 : 0;
  // If not focused, move the scene far away.
  const translate = focused ? 0 : 1000000;
  return {
    opacity,
    transform: [{ translateX: translate }, { translateY: translate }],
  };
}

function forVertical(props) {
  const { layout, position, scene } = props;

  if (!layout.isMeasured) {
    return forInitial(props);
  }
  
  if(scene.route.routeName === 'singleImage'){
    return forSingleImageView(props)
  }else if(_.includes([
    'userInfo',
    'verification',
    'loginProcess',
  ],scene.route.routeName)){
    return forHorizontalIOS(props)
  }else{
    return forVerticalIOS(props)
  }
}

function forSingleImageView(props){
  const { layout, position, scene } = props;

  const index = scene.index;
  const height = layout.initHeight;

  const opacity = position.interpolate({
    inputRange: ([
      index - 1,
      index - 0.99,
      index,
      index + 0.99,
      index + 1,
    ]),
    outputRange: ([0, 1, 1, 0.3, 0]),
  });

  const scaleX = position.interpolate({
    inputRange: ([index - 1, index, index + 1]),
    outputRange: ([0, 1, 0]),
  });;
  const scaleY = position.interpolate({
    inputRange: ([index - 1, index, index + 1]),
    outputRange: ([0, 1, 0]),
  });


  return {
    // opacity,
    // transform: [{ scaleX }, { scaleY }],
  };
}

function forVerticalIOS(props){
  const { layout, position, scene } = props;

  const index = scene.index;
  const height = layout.initHeight;

  const opacity = position.interpolate({
    inputRange: ([
      index - 1,
      index - 0.99,
      index,
      index + 0.99,
      index + 1,
    ]),
    outputRange: ([0, 1, 1, 0.3, 0]),
  });

  const translateX = 0;
  const translateY = position.interpolate({
    inputRange: ([index - 1, index, index + 1]),
    outputRange: ([height, 0, 0]),
  });


  return {
    // opacity,
    transform: [{ translateX }, { translateY }],
  };
}

function forHorizontalIOS(props) {
  const { layout, position, scene } = props;

  if (!layout.isMeasured) {
    return forInitial(props);
  }

  const index = scene.index;
  const inputRange = [index - 1, index, index + 1];

  const width = layout.initWidth;
  const outputRange = I18nManager.isRTL
    ? ([-width, 0, 10])
    : ([width, 0, -10]);

  // Add [index - 1, index - 0.99] to the interpolated opacity for screen transition.
  // This makes the screen's shadow to disappear smoothly.
  const opacity = position.interpolate({
    inputRange: ([
      index - 1,
      index - 0.99,
      index,
      index + 0.99,
      index + 1,
    ]),
    outputRange: ([0, 1, 1, 0.3, 0]),
  });

  const translateY = 0;
  const translateX = position.interpolate({
    inputRange,
    outputRange,
  });

  return {
    // opacity,
    transform: [{ translateX }, { translateY }],
  };
}

export default {
  forVertical
}