import {Image, ImageSourcePropType} from 'react-native';
import RNPhotoManipulator, {ImageSource} from 'react-native-photo-manipulator';
import {MimeType} from 'react-native-photo-manipulator/lib/PhotoManipulatorTypes';
import {xyCoordinates} from './interfaces';

export function imageSource(name: string) {
  switch (name) {
    case 'apple':
      return require('../assets/images/fa/apple.png');
    case 'arrow-up':
      return require('../assets/images/fa/arrow-up.png');
    case 'bomb':
      return require('../assets/images/fa/bomb.png');
    case 'bullseye':
      return require('../assets/images/fa/bullseye.png');
    case 'caret-right':
      return require('../assets/images/fa/caret-right.png');
    case 'blue-square':
      return require('../assets/images/blue-square.png');
    case 'green-square':
      return require('../assets/images/green-square.png');
  }
}

// JESSEFIX - give this a more better name
export async function getImageFilePath(
  image: ImageSource,
  size: xyCoordinates,
): Promise<any> {
  let result = null;
  const cropRegion = {x: 0, y: 0, height: size.y, width: size.x};
  const targetSize = {height: size.y, width: size.x};
  const mimeType = MimeType.PNG;
  await RNPhotoManipulator.crop(image, cropRegion, targetSize, mimeType).then(
    path => {
      console.log('PATH is ' + path);
      result = path;
    },
  );
  return result;
}

export function rotateImage(uri: ImageSourcePropType): JSX.Element {
  return <Image source={uri} style={{transform: [{rotateZ: `1.0rad`}]}} />;
}
