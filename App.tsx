import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  PanResponderGestureState,
  PanResponderStatic,
  Animated,
} from 'react-native';

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
    return gesture.moveY < 200;
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

export default class App extends Component {
  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.dropZone}>
          <Text style={styles.text}>Drop them here!</Text>
        </View>
        <View style={styles.ballContainer} />
        <View style={styles.row}>
          <Draggable />
          <Draggable />
          <Draggable />
          <Draggable />
          <Draggable />
        </View>
      </View>
    );
  }
}

let CIRCLE_RADIUS = 30;

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
  },
  dropZone: {
    height: 200,
    backgroundColor: '#00334d',
  },
  text: {
    marginTop: 25,
    marginLeft: 5,
    marginRight: 5,
    textAlign: 'center',
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
  },
});
