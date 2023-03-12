import React, {Component} from 'react';
import {Image, View} from 'react-native';

import CrazyBox from './crazy-box';
import {imageSource} from '../utils/files';

const UNDEFINED_NUMBER = -1;
const MINIMUM_SIZE_RATIO = 0.1;

export type xyCoordinates = {
  x: number;
  y: number;
};

interface DraggableImageProps {
  imageName?: string;
  displaySizeProportion: number;
  dropBehavior?: Function | null;
}

interface DraggableImageState {
  showDraggableImage: boolean;
  naturalWidth: number;
  naturalHeight: number;
  displayWidth: number;
  displayHeight: number;
}

export default class DraggableImage extends Component<
  DraggableImageProps,
  DraggableImageState
> {
  private _ref: View | null;
  private _startLocation: xyCoordinates;

  constructor(props: any) {
    super(props);

    this._ref = null;
    this._startLocation = {x: 0, y: 0};

    this.state = {
      showDraggableImage: true,
      naturalWidth: UNDEFINED_NUMBER,
      naturalHeight: UNDEFINED_NUMBER,
      displayWidth: UNDEFINED_NUMBER,
      displayHeight: UNDEFINED_NUMBER,
    };
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
        naturalWidth: temp.width,
        naturalHeight: temp.height,
        displayWidth: Math.round(temp.width * ratio),
        displayHeight: Math.round(temp.height * ratio),
      },
      () =>
        console.log(
          'Image ' +
            this.props.imageName +
            ' resized to ' +
            this.state.displayWidth +
            ' x ' +
            this.state.displayHeight,
        ),
    );
  }

  handleDrop = (dropCoordinates: xyCoordinates) => {
    // Determine the relative position of the dropped CrazyBox vs.
    // the page origin (which happens to be the drop-spot's origin, too).
    let adjustedCoords = {
      x:
        (dropCoordinates.x + this._startLocation.x) /
        this.props.displaySizeProportion,
      y:
        (dropCoordinates.y + this._startLocation.y) /
        this.props.displaySizeProportion,
    };
    console.log(`Dropped at: ${adjustedCoords.x}, ${adjustedCoords.y}`);
    if (this.props.dropBehavior)
      this.props.dropBehavior(this.props.imageName, adjustedCoords);
  };

  render() {
    return (
      <View
        ref={ref => (this._ref = ref)}
        style={{
          width: this.state.displayWidth,
          height: this.state.displayHeight,
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
        <CrazyBox
          dimensions={{x: this.state.displayWidth, y: this.state.displayHeight}}
          onDrop={this.handleDrop}
          imageName={this.props.imageName}
        />
      </View>
    );
  }
}
