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

const DROP_AREA_HEIGHT = 300;

type xyCoordinates = {
  x: number;
  y: number;
};

interface DraggableProps {
  //code related to your props goes here
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
          console.log(
            'Dropped at: ' +
              JSON.stringify(this.state.pan.x) +
              ', ' +
              JSON.stringify(this.state.pan.y),
          );
          console.log('_val: ' + this._val.x + ', ' + this._val.y);
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
    if (this.state.showDraggable) {
      return (
        <View style={{position: 'absolute'}}>
          <Animated.View
            {...this.panResponder.panHandlers}
            style={[panStyle, styles.circle, {opacity: this.state.opacity}]}
          />
        </View>
      );
    }
  }
}

interface AppProps {
  //code related to your props goes here
}

interface AppState {
  imageWidth: number | null;
}

export default class App extends Component<AppProps, AppState> {
  constructor(props: any) {
    super(props);

    this.state = {
      imageWidth: null,
    };
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.dropZone}>
          <ImageBackground
            source={require('./src/assets/images/profile-bg-bw.jpg')}
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
        <View style={styles.ballContainer} />
        <View style={styles.row}>
          <Draggable />
          <Draggable />
          <Draggable />
        </View>
      </View>
    );
  }
}

let CIRCLE_RADIUS = 40;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  ballContainer: {
    height: 200,
  },
  circle: {
    backgroundColor: 'skyblue',
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  dropZone: {
    height: DROP_AREA_HEIGHT,
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
  text: {
    marginTop: 60,
    width: '100%',
    textAlign: 'center',
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
  },
});
