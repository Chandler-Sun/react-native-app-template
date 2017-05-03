
/**
 * Render the initial style when the initial layout isn't measured yet.
 */
function forInitial(props) {
  const {
    navigationState,
    scene,
  } = props;

  const focused = navigationState.index === scene.index;
  const opacity = focused ? 1 : 0;
  // If not focused, move the scene to the far away.
  const translate = focused ? 0 : 1000000;
  return {
    opacity,
    transform: [
      { translateX: translate },
      { translateY: translate },
    ],
  };
}

export function customAnimationUpDown(props,computedProps) {
  const {
    layout,
    position,
    scene,
  } = props;

  if (!layout.isMeasured) {
    return forInitial(props);
  }

  const index = scene.index;
  const inputRange = [index - 1, index, index + 1];
  const height = layout.initHeight;

  const opacity = position.interpolate({
    inputRange,
    outputRange: [1, 1, 0.3],
  });

  const scale = position.interpolate({
    inputRange,
    outputRange: [1, 1, 0.95],
  });

  const translateX = 0;
  const translateY = position.interpolate({
    inputRange,
    outputRange: [-height, 0, -10],
  });

  return {
    opacity,
    transform: [
      { scale },
      { translateX },
      { translateY },
    ],
  };
}
