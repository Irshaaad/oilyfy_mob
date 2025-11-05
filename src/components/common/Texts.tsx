import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  useWindowDimensions,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useAppSelector } from '../../redux/store';
import { COLORS, FONTS } from '../../utils/theme';
interface ITextProps extends TextProps {
  underline?: boolean;
  bold?: boolean;
  color?: any;
  textStyle?: TextStyle | TextStyle[];
  italic?: boolean;
  center?: boolean;
  left?: boolean;
  right?: boolean;
  goku?: boolean;
}

export const TextNormal: React.FC<ITextProps> = props => {
  const {
    children,
    color = 'black',
    underline,
    textStyle,
    italic,
    bold,
    center,
    right,
    left,
  } = props;

  const { fontScale } = useWindowDimensions();
  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const styles = dynamicStyles(!!isRTL, fontScale);
  const { t } = useTranslation();

  return (
    <Text
      adjustsFontSizeToFit={true}
      style={[
        styles.text,
        styles.normal,
        color && { color },
        underline && styles.underline,
        textStyle && textStyle,
        italic && styles.italic,
        bold && styles.bold,
        center && styles.center,
        right && styles.right,
        left && styles.left,
      ]}
      {...props}>
      {typeof children != 'string' ? children : t(children)}
    </Text>
  );
};

export const TextSmall: React.FC<ITextProps> = props => {
  const {
    children,
    color,
    underline,
    textStyle,
    italic,
    bold,
    center,
    right,
    left,
  } = props;

  const { fontScale } = useWindowDimensions();
  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const styles = dynamicStyles(!!isRTL, fontScale);
  const { t } = useTranslation();

  return (
    <Text
      adjustsFontSizeToFit={true}
      style={[
        styles.text,
        styles.small,
        color && { color },
        underline && styles.underline,
        textStyle && textStyle,
        italic && styles.italic,
        bold && styles.bold,
        center && styles.center,
        right && styles.right,
        left && styles.left,
      ]}
      {...props}>
      {typeof children != 'string' ? children : t(children)}
    </Text>
  );
};

export const TextSmaller: React.FC<ITextProps> = props => {
  const {
    children,
    color,
    underline,
    textStyle,
    italic,
    bold,
    center,
    right,
    left,
  } = props;

  const { fontScale } = useWindowDimensions();
  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const styles = dynamicStyles(!!isRTL, fontScale);
  const { t } = useTranslation();

  return (
    <Text
      adjustsFontSizeToFit={true}
      style={[
        styles.text,
        styles.smaller,
        color && { color },
        underline && styles.underline,
        textStyle && textStyle,
        italic && styles.italic,
        bold && styles.bold,
        center && styles.center,
        right && styles.right,
        left && styles.left,
      ]}
      {...props}>
      {typeof children != 'string' ? children : t(children)}
    </Text>
  );
};

export const TextBig: React.FC<ITextProps> = props => {
  const {
    children,
    color,
    underline,
    textStyle,
    italic,
    bold,
    center,
    right,
    left,
  } = props;

  const { fontScale } = useWindowDimensions();
  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const styles = dynamicStyles(!!isRTL, fontScale);
  const { t } = useTranslation();

  return (
    <Text
      adjustsFontSizeToFit={true}
      style={[
        styles.text,
        styles.big,
        color && { color },
        underline && styles.underline,
        textStyle && textStyle,
        italic && styles.italic,
        bold && styles.bold,
        center && styles.center,
        right && styles.right,
        left && styles.left,
      ]}
      {...props}>
      {typeof children != 'string' ? children : t(children)}
    </Text>
  );
};

export const TextBigger: React.FC<ITextProps> = props => {
  const {
    children,
    color,
    underline,
    textStyle,
    italic,
    bold,
    center,
    right,
    left,
  } = props;

  const { fontScale } = useWindowDimensions();
  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const styles = dynamicStyles(!!isRTL, fontScale);
  const { t } = useTranslation();

  return (
    <Text
      adjustsFontSizeToFit={true}
      style={[
        styles.text,
        styles.bigger,
        color && { color },
        underline && styles.underline,
        textStyle && textStyle,
        italic && styles.italic,
        bold && styles.bold,
        center && styles.center,
        right && styles.right,
        left && styles.left,
      ]}
      {...props}>
      {typeof children != 'string' ? children : t(children)}
    </Text>
  );
};

const dynamicStyles = (isRTL: boolean, fontScale: number) =>
  StyleSheet.create({
    text: {
      color: COLORS.black || 'black',
      // fontFamily: FONTS['sf-pro-display'].reqular,
      textAlign: isRTL ? 'right' : 'left',
    },
    smaller: {
      fontSize: RFValue(7) / fontScale,
    },
    small: {
      fontSize: RFValue(10) / fontScale,
    },
    normal: {
      fontSize: RFValue(12) / fontScale,
    },
    big: {
      fontSize: RFValue(15) / fontScale,
    },
    bigger: {
      fontSize: RFValue(19) / fontScale,
    },
    underline: {
      textDecorationLine: 'underline',
    },
    bold: {
      // fontFamily: FONTS['sf-pro-display'].bold,
      fontWeight: '500'
    },
    italic: { fontFamily: FONTS['sf-pro-display'].italic },
    center: {
      textAlign: 'center',
    },
    left: {
      textAlign: isRTL ? 'right' : 'left',
    },
    right: {
      textAlign: isRTL ? 'left' : 'right',
    },
  });
