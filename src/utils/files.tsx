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

export async function createLocalImageFile(
  image: ImageSource,
  size: xyCoordinates,
): Promise<any> {
  let result = null;
  const cropRegion = {x: 0, y: 0, height: size.y, width: size.x};
  const targetSize = {height: size.y, width: size.x};
  const mimeType = MimeType.PNG; // alternately, JPEG
  await RNPhotoManipulator.crop(image, cropRegion, targetSize, mimeType).then(
    path => {
      console.log('PATH is ' + path);
      result = path;
    },
  );
  return result;
}

export function calculateDaysBetweenDates(begin: Date, end: Date) {
  const diff = Math.abs(end.getTime() - begin.getTime());
  return Math.ceil(diff / (1000 * 3600 * 24));
}
