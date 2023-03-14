import React, {Component} from 'react';
import {Image, View} from 'react-native';

import DraggableItem from './draggable-item';
import {imageSource} from '../utils/files';

const UNDEFINED_NUMBER = -1;
const MINIMUM_SIZE_RATIO = 0.1;

export type xyCoordinates = {
  x: number;
  y: number;
};

interface SuperimposePaletteButtonProps {
  imageName?: string;
  displaySizeProportion: number;
  dropBehavior?: Function | null;
}

interface SuperimposePaletteButtonState {
  show: boolean;
  naturalWidth: number;
  naturalHeight: number;
  displayWidth: number;
  displayHeight: number;
}

export default class SuperimposePaletteButton extends Component<
  SuperimposePaletteButtonProps,
  SuperimposePaletteButtonState
> {
  private _ref: View | null;
  private _startLocation: xyCoordinates;

  constructor(props: any) {
    super(props);

    this._ref = null;
    this._startLocation = {x: 0, y: 0};

    this.state = {
      show: true,
      naturalWidth: UNDEFINED_NUMBER,
      naturalHeight: UNDEFINED_NUMBER,
      displayWidth: UNDEFINED_NUMBER,
      displayHeight: UNDEFINED_NUMBER,
    };
  }

  componentDidMount(): void {
    if (this.props.imageName) {
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
  }

  handleDrop = (
    movementOfMidpoint: xyCoordinates,
    rotation: number,
    scale: number,
  ) => {
    // Determine the relative position of the dropped DraggableItem vs.
    // the page origin (which happens to be the drop-spot's origin, too).
    const yDeltaBasedOnScale = (this.state.displayHeight * (scale - 1)) / 2;
    const xDeltaBasedOnScale = (this.state.displayWidth * (scale - 1)) / 2;
    let upperLeftCorner = {
      x:
        (this._startLocation.x + movementOfMidpoint.x - yDeltaBasedOnScale) /
        this.props.displaySizeProportion,
      y:
        (this._startLocation.y + movementOfMidpoint.y - xDeltaBasedOnScale) /
        this.props.displaySizeProportion,
    };
    console.log(
      `Dropped at: ${upperLeftCorner.x}, ${upperLeftCorner.y} with rotation: ${rotation} and scale: ${scale}`,
    );
    if (this.props.dropBehavior)
      this.props.dropBehavior(
        this.props.imageName,
        upperLeftCorner,
        rotation,
        scale,
        {
          x: this.state.naturalWidth,
          y: this.state.naturalHeight,
        },
      );
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
        <DraggableItem
          dimensions={{x: this.state.displayWidth, y: this.state.displayHeight}}
          onDrop={this.handleDrop}
          imageName={this.props.imageName}
        />
      </View>
    );
  }
}
