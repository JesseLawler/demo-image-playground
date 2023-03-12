import React, {Component} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import GestureHandler, {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import RNPhotoManipulator from 'react-native-photo-manipulator';
//import {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';

import Ball from './src/components/ball';

const CIRCLE_RADIUS = 40;
const DEVICE_WIDTH = Dimensions.get('window').width;
const BG_IMAGE_SOURCE = require('./src/assets/images/profile-bg-bw.jpg');
const DROP_AREA_HEIGHT = 250;
const MINIMUM_SIZE_RATIO = 0.1;
const OPACITY_AFTER_DROP = 0.2;

const imageSource: any = (name: string) => {
  switch (name) {
    case 'apple':
      return require('./src/assets/images/fa/apple.png');
    case 'arrow-up':
      return require('./src/assets/images/fa/arrow-up.png');
    case 'bomb':
      return require('./src/assets/images/fa/bomb.png');
    case 'bullseye':
      return require('./src/assets/images/fa/bullseye.png');
    case 'caret-right':
      return require('./src/assets/images/fa/caret-right.png');
    case 'green-square':
      return require('./src/assets/images/green-square.png');
  }
};

type xyCoordinates = {
  x: number;
  y: number;
};

interface DraggableProps {
  imageName?: string;
  displaySizeProportion: number;
  dropBehavior?: Function | null;
}

interface DraggableState {
  showDraggable: boolean;
  pan: any;
  opacity: any;
  height: number;
  width: number;
}

class Draggable extends Component<DraggableProps, DraggableState> {
  panResponder: any;

  private _ref: any; // JESSEFIX
  private _val: xyCoordinates;
  private _startLocation: xyCoordinates;

  constructor(props: any) {
    super(props);

    this._val = {x: 0, y: 0};
    this._startLocation = {x: 0, y: 0};

    let pan = new Animated.ValueXY();
    pan.addListener((value: xyCoordinates) => {
      this._val = value;
    });

    this.state = {
      showDraggable: true,
      //dropAreaValues: null,
      pan: pan,
      opacity: new Animated.Value(1),
      height: 0,
      width: 0,
    };

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderGrant: (e, gesture) => {
        this.state.pan.setOffset({
          x: this._val.x,
          y: this._val.y,
        });
        this.state.pan.setValue({x: 0, y: 0});
      },
      onPanResponderMove: Animated.event(
        [null, {dx: this.state.pan.x, dy: this.state.pan.y}],
        {useNativeDriver: false},
      ),
      onPanResponderRelease: (e, gesture) => {
        if (this.isDropArea(gesture)) {
          if (this.props.dropBehavior) {
            // Determine the relative position of the dropped Draggable vs.
            // the page origin (which happens to be the drop-image's origin, too).
            let adjustedCoords = {
              x:
                (this._val.x + this._startLocation.x) /
                this.props.displaySizeProportion,
              y:
                (this._val.y + this._startLocation.y) /
                this.props.displaySizeProportion,
            };
            console.log(`Dropped at: ${adjustedCoords.x}, ${adjustedCoords.y}`);
            this.props.dropBehavior(this.props.imageName, adjustedCoords);
          }
          Animated.timing(this.state.opacity, {
            toValue: OPACITY_AFTER_DROP,
            duration: 1000,
            useNativeDriver: true,
          }).start(() => {
            this.setState({
              showDraggable: OPACITY_AFTER_DROP > 0,
            });
          });
        }
      },
    });
  }

  componentDidMount(): void {
    const temp = Image.resolveAssetSource(imageSource(this.props.imageName));
    const ratio = Math.max(
      MINIMUM_SIZE_RATIO,
      this.props.displaySizeProportion,
    );
    console.log(
      'this.props.displaySizeProportion: ' + this.props.displaySizeProportion,
    );
    this.setState(
      {
        height: Math.round(temp.height * ratio),
        width: Math.round(temp.width * ratio),
      },
      () =>
        console.log(
          'Image ' +
            this.props.imageName +
            ' resized to ' +
            this.state.width +
            ' x ' +
            this.state.height,
        ),
    );
  }

  isDropArea(gesture: PanResponderGestureState) {
    return gesture.moveY < DROP_AREA_HEIGHT; // JESSEFIX
  }

  render() {
    return (
      <View
        ref={ref => (this._ref = ref)}
        style={{
          width: this.state.width,
          height: this.state.height,
        }}
        onLayout={({nativeEvent}) => {
          if (this._ref) {
            this._ref.measure(
              (
                x: number,
                y: number,
                width: number,
                height: number,
                pageX: number,
                pageY: number,
              ) => {
                this._startLocation = {x: pageX, y: pageY};
                console.log(
                  'icon ' +
                    this.props.imageName +
                    "'s start location is: " +
                    pageX +
                    ', ' +
                    pageY,
                );
              },
            );
          }
        }}>
        {this.renderDraggable()}
      </View>
    );
  }

  renderDraggable() {
    const panStyle = {
      transform: this.state.pan.getTranslateTransform(),
    };
    let element = this.props.imageName ? (
      <Animated.Image
        {...this.panResponder.panHandlers}
        source={imageSource(this.props.imageName)}
        style={[
          panStyle,
          {
            width: this.state.width,
            height: this.state.height,
            opacity: this.state.opacity,
          },
        ]}
      />
    ) : (
      <Animated.View
        {...this.panResponder.panHandlers}
        style={[panStyle, styles.circle, {opacity: this.state.opacity}]}
      />
    );
    if (this.state.showDraggable) {
      return <View style={{position: 'absolute'}}>{element}</View>;
    }
  }
}

interface AppProps {
  //code related to your props goes here
}

interface AppState {
  arrayOfIconNames?: string[];
  displayProportion: number;
  dropAreaHeight: number;
  mergedImagePath: string;
  naturalImageDimensions: xyCoordinates | null;
}

export default class App extends Component<AppProps, AppState> {
  //scale = useSharedValue(1);
  //savedScale = useSharedValue(1);

  constructor(props: any) {
    super(props);

    this.state = {
      displayProportion: 0,
      dropAreaHeight: 0,
      mergedImagePath: '',
      naturalImageDimensions: null,
    };
  }

  /*
  animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: this.scale.value}],
  }));

  pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      this.scale.value = this.savedScale.value * e.scale;
    })
    .onEnd(() => {
      this.savedScale.value = this.scale.value;
    });
  */

  componentDidMount(): void {
    const temp = Image.resolveAssetSource(BG_IMAGE_SOURCE);
    const relativeHeight = Math.round(
      (temp.height / temp.width) * DEVICE_WIDTH,
    );
    this.setState({
      arrayOfIconNames: ['green-square', 'arrow-up', 'caret-right'],
      displayProportion: Math.round((DEVICE_WIDTH * 1000) / temp.width) / 1000,
      dropAreaHeight: relativeHeight,
      naturalImageDimensions: {x: temp.width, y: temp.height},
    });
  }

  mergeImage = (name: string, coords: xyCoordinates) => {
    const image = BG_IMAGE_SOURCE;
    const overlay = imageSource(name);
    RNPhotoManipulator.overlayImage(image, overlay, coords).then(path => {
      this.setState({mergedImagePath: path}, () =>
        console.log(
          `this.state.mergedImagePath: ${this.state.mergedImagePath}`,
        ),
      );
    });
  };

  render() {
    let details =
      'natural dimensions: ' +
      this.state.naturalImageDimensions?.x +
      ' x ' +
      this.state.naturalImageDimensions?.y +
      '\n' +
      'display dimensions: ' +
      DEVICE_WIDTH +
      ' x ' +
      this.state.dropAreaHeight +
      '\n' +
      'display percent: ' +
      Math.round(1000 * this.state.displayProportion) / 10 +
      '%';

    const mergedImage = this.state.mergedImagePath ? (
      <Image
        source={{uri: this.state.mergedImagePath}}
        resizeMode={'cover'}
        style={{width: DEVICE_WIDTH, height: this.state.dropAreaHeight}}
      />
    ) : null;

    return (
      <GestureHandlerRootView style={styles.mainContainer}>
        <View style={styles.dropZone}>
          <ImageBackground
            source={BG_IMAGE_SOURCE}
            style={{height: this.state.dropAreaHeight}}
            resizeMode="contain">
            <Text style={styles.text}>Drop them here!</Text>
            <Text style={styles.dropAreaDetails} numberOfLines={3}>
              {details}
            </Text>
          </ImageBackground>
        </View>
        <View style={styles.row}>
          {this.state.arrayOfIconNames?.map((iconName: string) => (
            <Draggable
              key={iconName}
              imageName={iconName}
              dropBehavior={this.mergeImage}
              displaySizeProportion={this.state.displayProportion}
            />
          ))}
        </View>
        {/*
        <GestureDetector gesture={this.pinchGesture}>
          <Animated.View
            style={[
              {backgroundColor: 'yellow', width: 300, height: 300},
              this.animatedStyle,
            ]}
          />
        </GestureDetector>
          */}
        <Ball />
        <View
          style={{
            width: DEVICE_WIDTH,
            height: this.state.dropAreaHeight,
            marginBottom: 30,
          }}>
          {mergedImage}
        </View>
      </GestureHandlerRootView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circle: {
    backgroundColor: 'skyblue',
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS,
  },
  row: {
    width: DEVICE_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  dropZone: {
    width: DEVICE_WIDTH,
    backgroundColor: '#00334d',
  },
  dropAreaDetails: {
    color: '#777777',
    fontSize: 15,
    lineHeight: 21,
    width: '100%',
    textAlign: 'center',
    position: 'absolute',
    bottom: -70,
  },
  text: {
    marginTop: 60,
    width: '100%',
    textAlign: 'center',
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
  },
});
