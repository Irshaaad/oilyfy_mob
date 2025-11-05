import React from 'react';
import {View, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../../utils/theme';

interface GradientWrapperInterface {
  children: React.ReactNode;
  containerStyle?: ViewStyle | ViewStyle[];
  showGradient?: boolean;
}

const GradientWrapper: React.FC<GradientWrapperInterface> = props => {
  const {children, containerStyle, showGradient = true} = props;

  const Wrapper = showGradient ? LinearGradient : View;

  return (
    <Wrapper
      colors={[COLORS.primaryGradient, COLORS.secondaryGradient]}
      start={{x: 1, y: 1}}
      end={{x: 0, y: 0}}
      style={containerStyle}>
      {children}
    </Wrapper>
  );
};

export default GradientWrapper;
