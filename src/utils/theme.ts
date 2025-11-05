import {heightToDP} from 'react-native-responsive-screens';
import {ms} from 'react-native-size-matters';

export const COLORS = {
  primary: '#084734',
  primaryGradient: '#084734',
  secondaryGradient: '#13AD7F',
  primaryLight: '#A9BABC',
  secondary: '#016268',
  black: '#000000',
  white: '#FFFFFF',
  orange: '#D87528',

  blue: '#005DE9',
  lightBlue: '#DDE8F9',
  darkBlue: '#114B9A',

  // background: "black",

  red: '#FF1B1B',
  green: '#00C257',
  lightGreen: '#DDE8E8',
  tealGreen: '#12676A',
  background: '#F6F6F6',

  lightWhite: 'rgba(255,255,255,0.2)',
  purple: '#4E1DFF',

  blackGrey: '#7E8389',
  grey: '#F9F9F9',
  darkGrey: '#424242',
  lightgrey: '#9BA1A4',
  borderGrey: '#E9E9E9',
  slateGrey: '#EDEDED',
  greyText: '#4E4E4E',

  // primary: '#004E80',
  // primaryLight: '#A9BABC',
  // secondary: '#F4F3E4',
  // black: '#000000',
  // lightgrey: '#9BA1A4',
  // grey: '#6B7280',
  // darkGrey: '#424242',
  // borderGrey: '#E9E9E9',
  // white: '#FFFFFF',
  // orange: '#D87528',
  // darkRed: '#A5281F',
  // brightRed: '#FF0000',
  // green: '#4AC17D',
};

export const FONTS = {
  roboto: {
    reqular: 'Roboto-Regular',
    bold: 'Robot-Bold',
    italic: 'Robot-italic',
  },
  'sf-pro-display': {
    reqular: 'SFProDisplay-Regular',
    bold: 'SFProDisplay-Bold',
    italic: 'SFProDisplay-LightItalic',
  },
};
//  "SFProDisplay-Bold",
//  "SFProDisplay-LightItalic",
//  "SFProDisplay-Regular",

export const FIXED_SIZES = {
  padding: ms(15),
  paddingHorizontal: ms(15),

  bigBorderRadius: ms(12),
  mediumBorderRadius: ms(10),
  smallBorderRadius: ms(8),

  buttonRadius: ms(40),
  buttonHeight: heightToDP(5),

  screenPadding: ms(12),
  screenHorizontalPadding: ms(50),

  dashHeaderHeight: heightToDP(30),
  screenHeaderHeight: heightToDP(15),
};
