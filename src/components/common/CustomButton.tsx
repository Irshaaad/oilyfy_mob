import React, {useContext} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';

import {widthToDP} from 'react-native-responsive-screens';
import {ms, scale} from 'react-native-size-matters';
import {AppThemeContext} from '../../Contexts/ThemeProviders';
import {AppThemeType} from '../../utils/interface';
import {COLORS, FIXED_SIZES} from '../../utils/theme';
import GradientWrapper from '../BackgroundWrappers/GradientWrapper';
import CustomIcon from './CustomIcon';
import {TextNormal, TextSmaller} from './Texts';
import {IconProps} from './types';

interface ICustomButtonProps extends TouchableOpacityProps {
  title: string;
  secondary?: boolean;
  containerStyle?: ViewStyle | ViewStyle[];
  textStyles?: TextStyle | TextStyle[];
  width?: any;
  tirtiary?: boolean;
  loading?: boolean;
  rightIcon?: IconProps;
  leftIcon?: IconProps;
  leftSVG?: any;
  rightSVG?: any;
  whityy?: boolean;
  textSmall?: boolean;
  gradient?: boolean;
  hideDisableStyle?: boolean;
}

const CustomButton: React.FC<ICustomButtonProps> = props => {
  const {
    title,
    onPress,
    textSmall,
    secondary,
    containerStyle,
    width,
    tirtiary,
    loading,
    disabled,
    rightIcon,
    leftIcon,
    leftSVG,
    rightSVG,
    textStyles,
    whityy,
    gradient,
    hideDisableStyle,
    ...rest
  } = props;

  const {theme} = useContext(AppThemeContext);
  const styles = dynamicStyle(theme);

  const Text = textSmall ? TextSmaller : TextNormal;

  if (secondary || tirtiary) {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          // styles.shadowProp,
          secondary && styles.secondary,
          tirtiary && styles.tirtiary,
          containerStyle,
          width && {width},
          !hideDisableStyle && disabled && styles.disabledButton,
        ]}
        onPress={onPress}
        disabled={disabled}
        {...rest}>
        {loading ? (
          <ActivityIndicator size={'small'} color={'white'} />
        ) : (
          <View style={styles.insideContainer}>
            {leftSVG
              ? leftSVG
              : leftIcon && <CustomIcon size={ms(18)} {...leftIcon} />}
            <Text
              bold
              color={
                !hideDisableStyle && disabled
                  ? '#CED7DA'
                  : tirtiary
                  ? COLORS.primary
                  : COLORS.black
              }
              textStyle={textStyles}>
              {title}
            </Text>
            {rightSVG
              ? rightSVG
              : rightIcon && <CustomIcon size={ms(18)} {...rightIcon} />}
          </View>
        )}
      </TouchableOpacity>
    );
  }
  if (gradient) {
    return (
      <GradientWrapper
        containerStyle={[
          styles.gradientContainer,
          styles.shadowProp,
          containerStyle,
          width && {width},
        ]}>
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || loading}
          style={[styles.gradientSubContainer]}>
          {loading ? (
            <ActivityIndicator size={'small'} color={'white'} />
          ) : (
            <View style={styles.insideContainer}>
              {leftSVG
                ? leftSVG
                : leftIcon && <CustomIcon size={ms(18)} {...leftIcon} />}
              <TextNormal
                color={disabled ? '#CED7DA' : COLORS.white}
                textStyle={textStyles}>
                {title}
              </TextNormal>
              {rightSVG
                ? rightSVG
                : rightIcon && <CustomIcon size={ms(18)} {...rightIcon} />}
            </View>
          )}
        </TouchableOpacity>
      </GradientWrapper>
    );
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        styles.shadowProp,
        width && {width},
        containerStyle,
        !hideDisableStyle && disabled && styles.disabledButton,
        whityy && {backgroundColor: COLORS.lightWhite},
      ]}>
      {loading ? (
        <ActivityIndicator size={'small'} color={'white'} />
      ) : (
        <View style={styles.insideContainer}>
          {leftSVG
            ? leftSVG
            : leftIcon && <CustomIcon size={ms(18)} {...leftIcon} />}
          <TextNormal bold color={COLORS.white} textStyle={textStyles}>
            {title}
          </TextNormal>
          {rightSVG
            ? rightSVG
            : rightIcon && <CustomIcon size={ms(18)} {...rightIcon} />}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const dynamicStyle = (_theme: AppThemeType) =>
  StyleSheet.create({
    container: {
      // minHeight: 50,
      // minWidth: 130,
      // width: '100%',
      paddingHorizontal: widthToDP(2),
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5,
      height: FIXED_SIZES.buttonHeight,
    },
    secondary: {
      backgroundColor: COLORS.secondary,
    },

    tirtiary: {
      backgroundColor: 'transparent',
      borderColor: COLORS.primary,
      borderWidth: 1,
    },

    shadowProp: {
      shadowColor: COLORS.primary,
      shadowOffset: {width: -5, height: 5},
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 5,
    },

    linearChild: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },

    disabledButton: {
      backgroundColor: COLORS.lightgrey,
    },

    insideContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    gradientContainer: {
      borderRadius: 10,
      height: FIXED_SIZES.buttonHeight,
    },

    gradientSubContainer: {
      paddingHorizontal: scale(15),
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
  });
