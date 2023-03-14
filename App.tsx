import React, {Component} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';

import {imageSource} from './src/utils/files';
import {xyCoordinates} from './src/utils/interfaces';
import SuperimposePaletteButton from './src/components/superimpose-palette-button';

const CIRCLE_RADIUS = 40;
const DEVICE_WIDTH = Dimensions.get('window').width;
const BG_IMAGE_SOURCE = require('./src/assets/images/profile-bg-bw.jpg');
const MERGE_HIGHLIGHT_COLOR = '#cc00ff';
const OUTPUT_IMAGE_FORMAT = 'jpg';
const OUTPUT_IMAGE_FILENAME = 'myfile.' + OUTPUT_IMAGE_FORMAT;
const OUTPUT_IMAGE_QUALITY = 0.9;

interface AppProps {
  //code related to your props goes here
}

interface AppState {
  arrayOfIconNames: string[];
  displayProportion: number;
  dropAreaHeight: number;
  imageLayers: any[];
  mergedImage: any;
  naturalImageDimensions: xyCoordinates;
}

export default class App extends Component<AppProps, AppState> {
  private _layoutArea: any;
  private _layerCounter = 0;

  constructor(props: any) {
    super(props);

    this.state = {
      arrayOfIconNames: [],
      displayProportion: 0,
      dropAreaHeight: 0,
      imageLayers: [],
      mergedImage: null,
      naturalImageDimensions: {x: 0, y: 0},
    };
  }

  componentDidMount(): void {
    const temp = Image.resolveAssetSource(BG_IMAGE_SOURCE);
    const relativeHeight = Math.round(
      (temp.height / temp.width) * DEVICE_WIDTH,
    );
    this.setState({
      arrayOfIconNames: [
        //'blue-square',
        //'green-square',
        'arrow-up',
        'caret-right',
        'apple',
      ],
      displayProportion: Math.round((DEVICE_WIDTH * 1000) / temp.width) / 1000,
      dropAreaHeight: relativeHeight,
      naturalImageDimensions: {x: temp.width, y: temp.height},
    });
  }

  createMergedImage = () => {
    // first, kill any previous mergedImage...
    this.setState({mergedImage: <View />}, () => {
      this._layoutArea.capture().then((uri: string) => {
        console.log('Merged image created in device storage at URI: ' + uri);
        const SCALE_AMOUNT = 0.9;
        const mergedImage = (
          <Image
            source={{uri: uri}}
            style={{
              position: 'absolute',
              left: Math.round(((1 - SCALE_AMOUNT) / 2) * DEVICE_WIDTH),
              top:
                -3 *
                Math.round(
                  ((1 - SCALE_AMOUNT) / 2) * this.state.dropAreaHeight,
                ),
              width: Math.round(DEVICE_WIDTH * SCALE_AMOUNT),
              height: Math.round(this.state.dropAreaHeight * SCALE_AMOUNT),
              borderWidth: 1,
              borderColor: MERGE_HIGHLIGHT_COLOR,
            }}
          />
        );
        this.setState({mergedImage: mergedImage});
      });
    });
  };

  setImageOverlay = async (
    name: string,
    coords: xyCoordinates,
    rotation: number,
    scale: number,
    naturalSize: xyCoordinates,
  ) => {
    const xAdjustment =
      ((1 - scale) * (naturalSize.x * this.state.displayProportion)) / 2;
    const yAdjustment =
      ((1 - scale) * (naturalSize.y * this.state.displayProportion)) / 2;
    let newImage = (
      <Image
        key={this._layerCounter.toString()}
        source={imageSource(name)}
        style={[
          {
            position: 'absolute',
            left: coords.x * this.state.displayProportion - xAdjustment,
            top: coords.y * this.state.displayProportion - yAdjustment,
            width: naturalSize.x * this.state.displayProportion,
            height: naturalSize.y * this.state.displayProportion,
            //backgroundColor: 'rgba(255,0,255,0.4)',
          },
          {
            transform: [
              {
                scale: scale,
              },
              {
                rotateZ: `${rotation}rad`,
              },
            ],
          },
        ]}
      />
    );
    this._layerCounter += 1;

    // Add newImage to the imageLayers array
    let arr = this.state.imageLayers;
    arr.push(newImage);
    this.setState({imageLayers: arr});
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
          {this.state.arrayOfIconNames.map(iconName => (
            <SuperimposePaletteButton
              key={iconName}
              imageName={iconName}
              dropBehavior={this.setImageOverlay}
              displaySizeProportion={this.state.displayProportion}
            />
          ))}
        </View>
        <Pressable
          style={{
            paddingVertical: 8,
            paddingHorizontal: 20,
            borderRadius: 8,
            backgroundColor: 'rgba(0,0,255,0.1)',
            borderColor: MERGE_HIGHLIGHT_COLOR,
            borderWidth: 2,
          }}
          onPress={this.createMergedImage}>
          <Text style={{color: 'white', fontSize: 18, fontWeight: '500'}}>
            Render Merged Image
          </Text>
        </Pressable>
        <ViewShot
          ref={ref => (this._layoutArea = ref)}
          style={{
            width: DEVICE_WIDTH,
            height: this.state.dropAreaHeight,
            marginBottom: 30,
          }}
          options={{
            fileName: OUTPUT_IMAGE_FILENAME,
            format: OUTPUT_IMAGE_FORMAT,
            quality: OUTPUT_IMAGE_QUALITY,
          }}>
          <ImageBackground
            source={BG_IMAGE_SOURCE}
            style={{height: this.state.dropAreaHeight}}
            resizeMode="contain"></ImageBackground>
          {this.state.imageLayers.map((image: JSX.Element) => image)}
          {this.state.mergedImage}
        </ViewShot>
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
    alignContent: 'center',
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
