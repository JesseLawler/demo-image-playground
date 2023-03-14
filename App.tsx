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
import RNPhotoManipulator, {
  ImageSource,
  PhotoBatchOperations,
} from 'react-native-photo-manipulator';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import ViewShot from 'react-native-view-shot';

import {getImageFilePath, imageSource, rotateImage} from './src/utils/files';
import {xyCoordinates} from './src/utils/interfaces';
import SuperimposePaletteButton from './src/components/superimpose-palette-button';

const CIRCLE_RADIUS = 40;
const DEVICE_WIDTH = Dimensions.get('window').width;
const BG_IMAGE_SOURCE = require('./src/assets/images/profile-bg-bw.jpg');
const MERGE_HIGHLIGHT_COLOR = '#cc00ff';

interface AppProps {
  //code related to your props goes here
}

interface AppState {
  arrayOfIconNames?: string[];
  displayProportion: number;
  dropAreaHeight: number;
  imageLayers: any[]; // JESSEFIX
  //mergeOperations: PhotoBatchOperations[];
  //mergedImagePath: string;
  mergedImage: any;
  naturalImageDimensions: xyCoordinates;
}

export default class App extends Component<AppProps, AppState> {
  private _layoutArea: any;

  constructor(props: any) {
    super(props);

    this.state = {
      displayProportion: 0,
      dropAreaHeight: 0,
      imageLayers: [],
      //mergeOperations: [],
      //mergedImagePath: '',
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
      /* JESSEFIX - text demo
      mergeOperations: [
        {
          operation: 'text' as any,
          options: {
            position: {x: 50, y: 30},
            text: 'Text is GREAT!!!',
            textSize: 30,
            color: '#ff0000',
          },
        },
      ],
      */
      naturalImageDimensions: {x: temp.width, y: temp.height},
    });
  }

  createMergedImage = () => {
    const SCALE_AMOUNT = 0.9;
    this._layoutArea.capture().then((uri: string) => {
      console.log('Merged image created in device storage at URI: ' + uri);
      const mergedImage = (
        <Image
          source={{uri: uri}}
          style={{
            position: 'absolute',
            left: Math.round(((1 - SCALE_AMOUNT) / 2) * DEVICE_WIDTH),
            top:
              -3 *
              Math.round(((1 - SCALE_AMOUNT) / 2) * this.state.dropAreaHeight),
            width: Math.round(DEVICE_WIDTH * SCALE_AMOUNT),
            height: Math.round(this.state.dropAreaHeight * SCALE_AMOUNT),
            borderWidth: 1,
            borderColor: MERGE_HIGHLIGHT_COLOR,
          }}
        />
      );
      this.setState({mergedImage: mergedImage});
    });
  };

  // JESSEFIX - make better name
  mergeImage = async (
    name: string,
    coords: xyCoordinates,
    rotation: number,
    scale: number,
    naturalSize: xyCoordinates,
  ) => {
    const RESIZE_QUALITY = 100; // do this transformation at max quality, since it's going to be re-smashed into the background image in the next step
    const MERGE_QUALITY = 90;
    let newImage: JSX.Element = <View />; // empty default
    if (scale === 1 && rotation === 0) {
      newImage = (
        <Image
          source={imageSource(name)}
          style={{
            position: 'absolute',
            left: coords.x * this.state.displayProportion,
            top: coords.y * this.state.displayProportion,
            width: naturalSize.x * this.state.displayProportion,
            height: naturalSize.y * this.state.displayProportion,
            //backgroundColor: 'rgba(255,0,255,0.4)',
          }}
        />
      );
    } else {
      let path = await getImageFilePath(imageSource(name), naturalSize);
      //console.log('File path for ' + name + ': ' + path);
      const resizedWidth = Math.round(naturalSize.x * scale);
      const resizedHeight = Math.round(naturalSize.y * scale);
      await ImageResizer.createResizedImage(
        path,
        resizedWidth,
        resizedHeight,
        'PNG', // JPEG, PNG, or WEBP (Android only)
        RESIZE_QUALITY,
        0,
        // no need to set the optional outputPath parameter
      )
        .then(response => {
          // response.uri is the URI of the new image that can now be displayed, uploaded...
          // response.path is the path of the new image
          // response.name is the name of the new image with the extension
          // response.size is the size of the new image

          newImage = (
            <Image
              source={{uri: response.uri}}
              style={[
                {
                  position: 'absolute',
                  left: coords.x * this.state.displayProportion,
                  top: coords.y * this.state.displayProportion,
                  width: resizedWidth * this.state.displayProportion,
                  height: resizedHeight * this.state.displayProportion,
                  //backgroundColor: 'rgba(255,0,255,0.4)',
                },
                {transform: [{rotateZ: `${rotation}rad`}]},
              ]}
            />
          );
        })
        .catch(err => {
          console.warn(`Error resizing + rotating image '${name}: ${err}`);
        });
    }

    // Add newImage to the imageLayers array
    let arr = this.state.imageLayers;
    arr.push(newImage);
    this.setState({imageLayers: arr});
    /*
    // Next, add an item to the array of mergeOperations
    let arr = this.state.mergeOperations;
    arr.push({
      operation: 'overlay' as any,
      overlay: imageToOverlay,
      position: coords,
    });
    this.setState({mergeOperations: arr}, () => {
      // Finally, after the state has been updated, (re)perform the merge...
      const image = BG_IMAGE_SOURCE;
      const cropRegion = {
        x: 0,
        y: 0,
        width: this.state.naturalImageDimensions.x,
        height: this.state.naturalImageDimensions.y,
      }; // i.e. no crop whatsoever
      const targetSize = {
        width: this.state.naturalImageDimensions.x,
        height: this.state.naturalImageDimensions.y,
      }; // i.e. same size
      RNPhotoManipulator.batch(
        image,
        this.state.mergeOperations,
        cropRegion,
        targetSize,
        MERGE_QUALITY,
      ).then(path => {
        this.setState({mergedImagePath: path}, () =>
          console.log(
            `this.state.mergedImagePath: ${this.state.mergedImagePath}`,
          ),
        );
      });
    });
    */
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

    /*
    const mergedImage = this.state.mergedImagePath ? (
      <Image
        source={{uri: this.state.mergedImagePath}}
        resizeMode={'cover'}
        style={{width: DEVICE_WIDTH, height: this.state.dropAreaHeight}}
      />
    ) : null;
      */

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
            <SuperimposePaletteButton
              imageName={iconName}
              dropBehavior={this.mergeImage}
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
            fileName: 'Your-File-Name-JESSEFIX',
            format: 'jpg',
            quality: 0.9,
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
