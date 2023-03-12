import React, {Component} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RNPhotoManipulator from 'react-native-photo-manipulator';

import {imageSource} from './src/utils/files';
import {xyCoordinates} from './src/utils/interfaces';
import DraggableImage from './src/components/draggable-image';

const CIRCLE_RADIUS = 40;
const DEVICE_WIDTH = Dimensions.get('window').width;
const BG_IMAGE_SOURCE = require('./src/assets/images/profile-bg-bw.jpg');

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
  constructor(props: any) {
    super(props);

    this.state = {
      displayProportion: 0,
      dropAreaHeight: 0,
      mergedImagePath: '',
      naturalImageDimensions: null,
    };
  }

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
      <View style={styles.mainContainer}>
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
            <DraggableImage
              imageName={iconName}
              dropBehavior={this.mergeImage}
              displaySizeProportion={this.state.displayProportion}
            />
          ))}
        </View>
        <View
          style={{
            width: DEVICE_WIDTH,
            height: this.state.dropAreaHeight,
            marginBottom: 30,
          }}>
          {mergedImage}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'black',
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
