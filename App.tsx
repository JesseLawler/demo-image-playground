import React, {Component} from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RNPhotoManipulator from 'react-native-photo-manipulator';

const DROP_AREA_HEIGHT = 250;
const DROP_AREA_WIDTH = 360;

const BG_IMAGE_SOURCE = require('./src/assets/images/profile-bg-bw.jpg');

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
  }
};

type xyCoordinates = {
  x: number;
  y: number;
};

interface DraggableProps {
  imageName?: string;
  dropBehavior?: Function | null;
}

interface DraggableState {
  showDraggable: boolean;
  pan: any;
  opacity: any;
}

class Draggable extends Component<DraggableProps, DraggableState> {
  panResponder: any;

  private _val: xyCoordinates;

  constructor(props: any) {
    super(props);

    this._val = {x: 0, y: 0};

    let pan = new Animated.ValueXY();
    pan.addListener((value: xyCoordinates) => {
      this._val = value;
    });

    console.log('imageName: ' + this.props.imageName);

    this.state = {
      showDraggable: true,
      //dropAreaValues: null,
      pan: pan,
      opacity: new Animated.Value(1),
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
          console.log('Dropped at: ' + this._val.x + ', ' + this._val.y);
          if (this.props.dropBehavior)
            this.props.dropBehavior(this.props.imageName, this._val);
          Animated.timing(this.state.opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }).start(() =>
            this.setState({
              showDraggable: false,
            }),
          );
        }
      },
    });
  }

  isDropArea(gesture: PanResponderGestureState) {
    return gesture.moveY < DROP_AREA_HEIGHT;
  }

  render() {
    return (
      <View style={{width: '20%', alignItems: 'center'}}>
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
        style={[panStyle, styles.draggableImage, {opacity: this.state.opacity}]}
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
  imageWidth: number | null;
  mergedImagePath: string;
}

export default class App extends Component<AppProps, AppState> {
  constructor(props: any) {
    super(props);

    this.state = {
      imageWidth: null,
      mergedImagePath: '',
    };
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
    return (
      <View style={styles.mainContainer}>
        <View style={styles.dropZone}>
          <ImageBackground
            source={BG_IMAGE_SOURCE}
            style={{height: DROP_AREA_HEIGHT}}
            onLayout={event => {
              var {x, y, width, height} = event.nativeEvent.layout;
              this.setState({imageWidth: width});
            }}>
            <Text style={styles.text}>Drop them here!</Text>
            <Text style={styles.dropAreaDetails}>
              image dimensions: {this.state.imageWidth} x {DROP_AREA_HEIGHT}
            </Text>
          </ImageBackground>
        </View>
        <View style={styles.row}>
          <Draggable imageName={'bullseye'} dropBehavior={this.mergeImage} />
          <Draggable imageName={'bomb'} dropBehavior={this.mergeImage} />
          <Draggable imageName={'arrow-up'} dropBehavior={this.mergeImage} />
        </View>
        <Image
          source={{uri: this.state.mergedImagePath}}
          resizeMode={'cover'}
          style={styles.mergedImage}
        />
      </View>
    );
  }
}

let CIRCLE_RADIUS = 40;

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
  draggableImage: {
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  dropZone: {
    height: DROP_AREA_HEIGHT,
    width: DROP_AREA_WIDTH,
    backgroundColor: '#00334d',
  },
  dropAreaDetails: {
    color: '#777777',
    fontSize: 15,
    width: '100%',
    textAlign: 'center',
    position: 'absolute',
    bottom: -25,
  },
  mergedImage: {
    height: DROP_AREA_HEIGHT,
    width: DROP_AREA_WIDTH,
    marginBottom: 30,
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
