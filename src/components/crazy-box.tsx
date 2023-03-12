import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import {imageSource} from '../utils/files';
import {xyCoordinates} from '../utils/interfaces';

const MINIMUM_SIZE_RATIO = 0.1;
const SIZE_INCREASE_ON_PRESS = 1.2;

interface CrazyBoxParameters {
  dimensions: xyCoordinates;
  onDrop?: Function;
  imageName?: string;
}

const CrazyBox = ({dimensions, imageName, onDrop}: CrazyBoxParameters) => {
  const isPressed = useSharedValue(false);
  const offset = useSharedValue({x: 0, y: 0});
  const start = useSharedValue({x: 0, y: 0});
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: offset.value.x},
        {translateY: offset.value.y},
        {
          scale: withSpring(
            scale.value * (isPressed.value ? SIZE_INCREASE_ON_PRESS : 1),
          ),
        },
        {rotateZ: `${rotation.value}rad`},
      ],
      backgroundColor: imageName
        ? 'transparent'
        : isPressed.value
        ? 'yellow'
        : 'red',
    };
  });

  const relayCoordinates = (coords: xyCoordinates) => {
    if (onDrop) onDrop(coords);
  };

  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .onBegin(() => {
      'worklet';
      isPressed.value = true;
    })
    .onUpdate(e => {
      'worklet';
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
      runOnJS(relayCoordinates)(start.value);
    })
    .onFinalize(() => {
      'worklet';
      isPressed.value = false;
    });

  const zoomGesture = Gesture.Pinch()
    .onUpdate(event => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const rotateGesture = Gesture.Rotation()
    .onUpdate(event => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  const composed = Gesture.Simultaneous(
    dragGesture,
    Gesture.Simultaneous(zoomGesture, rotateGesture),
  );

  let draggableView = imageName ? (
    <Animated.Image
      source={imageSource(imageName)}
      style={[
        {
          width: dimensions.x,
          height: dimensions.y,
        },
        animatedStyles,
      ]}
    />
  ) : (
    <Animated.View
      style={[
        {width: dimensions.x, height: dimensions.y},
        styles.box,
        animatedStyles,
      ]}
    />
  );

  return (
    <Animated.View>
      <GestureDetector gesture={composed}>{draggableView}</GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  box: {
    borderRadius: 0,
    backgroundColor: 'red',
    alignSelf: 'center',
  },
});

export default CrazyBox;
