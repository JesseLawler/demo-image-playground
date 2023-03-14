import React from 'react';
import {StyleSheet} from 'react-native';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import {imageSource} from '../utils/files';
import {xyCoordinates} from '../utils/interfaces';

const MINIMUM_SCALE = 0.3;
const SIZE_INCREASE_ON_PRESS = 1.2;

interface DraggableItemParameters {
  dimensions: xyCoordinates;
  onDrop?: Function;
  imageName?: string;
}

const DraggableItem = ({
  dimensions,
  imageName,
  onDrop,
}: DraggableItemParameters) => {
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
      backgroundColor: isPressed.value ? '#cc00ff11' : 'transparent',
      borderWidth: 1,
      borderColor: isPressed.value ? '#cc00ff33' : 'transparent',
    };
  });

  const relayCoordinates = (
    coords: xyCoordinates,
    rotation: number,
    scale: number,
  ) => {
    if (onDrop) onDrop(coords, rotation, scale);
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
      //console.log(`offset.value.y: ${offset.value.y}`);
      runOnJS(relayCoordinates)(
        start.value,
        savedRotation.value,
        savedScale.value,
      );
    })
    .onFinalize(() => {
      'worklet';
      isPressed.value = false;
    });

  const zoomGesture = Gesture.Pinch()
    .onUpdate(event => {
      scale.value = Math.max(MINIMUM_SCALE, savedScale.value * event.scale);
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

export default DraggableItem;
