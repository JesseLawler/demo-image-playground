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
import {SketchCanvas} from '@sourcetoad/react-native-sketch-canvas';

import {imageSource} from './src/utils/files';
import {xyCoordinates} from './src/utils/interfaces';
import SuperimposePaletteButton from './src/components/superimpose-palette-button';
import {generateRandomNumber} from './src/utils/numbers';

const CIRCLE_RADIUS = 40;
const DEVICE_WIDTH = Dimensions.get('window').width;
const BG_IMAGE_SOURCE = require('./src/assets/images/profile-bg-bw.jpg');
const MANUAL_DRAWING_COLOR = '#00ffcc';
const MERGE_HIGHLIGHT_COLOR = '#cc00ff';
const OUTPUT_IMAGE_FORMAT = 'jpg';
const OUTPUT_IMAGE_FILENAME = 'myfile.' + OUTPUT_IMAGE_FORMAT;
const OUTPUT_IMAGE_QUALITY = 0.9;

interface AppProps {
  //code related to your props goes here
}

interface AppState {
  arrayOfIconNames: string[];
  bubble?: any;
  displayProportion: number;
  dropAreaHeight: number;
  hasDrawings: boolean;
  imageLayers: any[];
  isAwaitingAnnotationTap: boolean;
  mergedImage: any;
  naturalImageDimensions: xyCoordinates;
}

export default class App extends Component<AppProps, AppState> {
  private _drawingCanvas: any;
  private _duplicateCanvas: any;
  private _layoutArea: any;
  private _layerCounter = 0;

  constructor(props: any) {
    super(props);

    this.state = {
      arrayOfIconNames: [],
      displayProportion: 0,
      dropAreaHeight: 0,
      hasDrawings: false,
      imageLayers: [],
      isAwaitingAnnotationTap: false,
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

  addNote = () => {
    const defaultNoteText =
      'This is an annotation that a user will be able to type in.  Just a demo for right now.';
    const maxWidth = DEVICE_WIDTH / 2;
    const lineHeight = styles.bubbleText.lineHeight;
    const approximateLines = Math.ceil(defaultNoteText.length / 25);
    const height =
      lineHeight * approximateLines +
      2 * (styles.bubble.paddingVertical + styles.bubble.borderWidth);
    const blurb = (
      <View
        style={[
          styles.bubble,
          {
            maxWidth: maxWidth,
            height: height,
          },
        ]}>
        <Text numberOfLines={10} style={styles.bubbleText}>
          {defaultNoteText}
        </Text>
        <Text
          style={[
            styles.bubbleInstruction,
            {left: maxWidth + 5, height: height},
          ]}>
          Tap the image where you would like this annotation to point.
        </Text>
      </View>
    );
    this.setState({bubble: blurb, isAwaitingAnnotationTap: true});
  };

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

  clearSketches = () => {
    this._drawingCanvas.clear();
    this._duplicateCanvas.clear();
    this.setState({hasDrawings: false});
  };

  duplicateDrawing = () => {
    setTimeout(() => {
      this.setState({hasDrawings: true});
      // get the updated paths
      let paths = this._drawingCanvas.getPaths();
      let latestPath = paths[paths.length - 1];
      //console.log(`latestPath: ${JSON.stringify(latestPath)}`);
      // add the new path
      this._duplicateCanvas.addPath(latestPath);
    }, 150); // add a brief delay so the paths are ready
  };

  handleDrawingStart = (x: number, y: number) => {
    if (this.state.isAwaitingAnnotationTap) {
      //console.log(`We have a touch at ${x}, ${y} on the drawing canvas.`);
      // add a new line
      let strLinePath = `{
        "path": {
          "id": ${generateRandomNumber()},
          "color": "white",
          "width": 3,
          "data": ["${x},${y}", "100,100", "0,0"]
        },
        "size": {
          "width": ${DEVICE_WIDTH},
          "height": ${this.state.dropAreaHeight}
        },
        "drawer": null
      }`; // JESSEFIX - These bezier curves are a trip. Figure out how to "aim" them better.
      let linePath = JSON.parse(strLinePath);
      this.setState({isAwaitingAnnotationTap: false, bubble: null}, () => {
        this._drawingCanvas.addPath(linePath);
      });
    }
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
            <SketchCanvas
              ref={ref => (this._drawingCanvas = ref)}
              style={{
                flex: 1,
                //borderColor: 'yellow',
                //borderWidth: 1,
              }}
              strokeColor={
                this.state.isAwaitingAnnotationTap
                  ? '#0000ffff'
                  : MANUAL_DRAWING_COLOR
              }
              strokeWidth={3}
              onStrokeStart={this.handleDrawingStart}
              onStrokeEnd={this.duplicateDrawing}
            />
            <Text style={styles.text}>Annotate this image!</Text>
          </ImageBackground>
        </View>
        <Text style={styles.dropAreaDetails} numberOfLines={3}>
          {details}
        </Text>
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
        <View style={{flexDirection: 'row'}}>
          <Pressable style={styles.button} onPress={this.addNote}>
            <Text style={styles.buttonText}>Add Note</Text>
          </Pressable>
          <Pressable
            style={[
              styles.button,
              this.state.hasDrawings ? {} : styles.disabled,
            ]}
            onPress={this.clearSketches}
            disabled={!this.state.hasDrawings}>
            <Text style={styles.buttonText}>Clear Sketches</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={this.createMergedImage}>
            <Text style={styles.buttonText}>Render Image</Text>
          </Pressable>
          {this.state.bubble}
        </View>

        <ViewShot
          ref={ref => (this._layoutArea = ref)}
          style={{
            position: 'absolute',
            bottom: 0,
            width: DEVICE_WIDTH,
            height: this.state.dropAreaHeight,
            marginBottom: 20,
          }}
          options={{
            fileName: OUTPUT_IMAGE_FILENAME,
            format: OUTPUT_IMAGE_FORMAT,
            quality: OUTPUT_IMAGE_QUALITY,
          }}>
          <ImageBackground
            source={BG_IMAGE_SOURCE}
            style={{height: this.state.dropAreaHeight}}
            resizeMode="contain">
            <SketchCanvas
              ref={ref => (this._duplicateCanvas = ref)}
              style={{flex: 1}}
              strokeColor={MANUAL_DRAWING_COLOR}
              strokeWidth={3}
              touchEnabled={false}
            />
          </ImageBackground>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,255,0.1)',
    borderColor: MERGE_HIGHLIGHT_COLOR,
    borderWidth: 2,
    marginTop: 20,
  },
  bubble: {
    position: 'absolute',
    top: 64,
    left: 4,
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'white',
  },
  bubbleInstruction: {
    position: 'absolute',
    fontSize: 14,
    /*fontStyle: 'italic',*/
    color: MANUAL_DRAWING_COLOR,
    fontWeight: '100',
    fontFamily: 'Helvetica',
    lineHeight: 17,
    textAlign: 'left',
    marginTop: 10,
  },
  bubbleText: {
    color: '#050505',
    fontSize: 15,
    /*fontStyle: 'italic',*/
    fontWeight: '400',
    fontFamily: 'Helvetica',
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  circle: {
    backgroundColor: 'skyblue',
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS,
  },
  disabled: {opacity: 0.7, borderColor: '#999999'},
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
    fontSize: 14,
    lineHeight: 20,
    width: '100%',
    textAlign: 'center',
    marginTop: 7,
  },
  text: {
    position: 'absolute',
    top: 40,
    width: '100%',
    textAlign: 'center',
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
  },
});
