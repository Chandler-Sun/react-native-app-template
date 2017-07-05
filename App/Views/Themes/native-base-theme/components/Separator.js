import { Platform,PixelRatio } from 'react-native';
import _ from 'lodash';

import variable from './../variables/platform';

export default (variables = variable) => {
  const theme = {
    '.bordered': {
      '.noTopBorder': {
        borderTopWidth: 0,
      },
      '.noBottomBorder': {
        borderBottomWidth: 0,
      },
      height: 35,
      paddingVertical: variables.listItemPadding + 1,
      borderBottomWidth: variables.borderWidth,
      borderTopWidth: variables.borderWidth,
      borderColor: variables.listBorderColor,
    },
    'NativeBase.Text': {
      fontSize: variables.tabBarTextSize,
    },
    '.noTopBorder': {
      borderTopWidth: 0,
    },
    '.noBottomBorder': {
      borderBottomWidth: 0,
    },
    '.first': {
      borderTopWidth: null,      
    },
    height: 38,
    backgroundColor: '#FAFAFA',
    flex: 1,
    justifyContent: 'center',
    borderBottomWidth: (1/PixelRatio.getPixelSizeForLayoutSize(1)),
    borderTopWidth: (1/PixelRatio.getPixelSizeForLayoutSize(1)),
    paddingLeft: variables.listItemPadding + 5,
    borderColor: variables.listBorderColor,
  };

  return theme;
};
