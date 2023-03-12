export const imageSource: any = (name: string) => {
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
    case 'green-square':
      return require('../assets/images/green-square.png');
  }
};
