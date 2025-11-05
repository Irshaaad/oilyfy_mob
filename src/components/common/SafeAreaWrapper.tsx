import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {KeyboardWrapper} from '../BackgroundWrappers/KeyboardWrapper';
import {COLORS} from '../../utils/theme';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  clipTop?: boolean;
  clipLeft?: boolean;
  clipBottom?: boolean;
  clipRight?: boolean;
  paddingValue?: number;
  dismissKeyboard?: boolean;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = props => {
  const {
    children,
    style,
    clipBottom,
    clipLeft,
    clipRight,
    clipTop,
    dismissKeyboard = false,
    paddingValue = 0,
  } = props;
  const {top, bottom, left, right} = useSafeAreaInsets();

  const edges = {
    paddingTop: !clipTop ? top + paddingValue : paddingValue,
    paddingBottom: !clipBottom ? bottom + paddingValue : paddingValue,
    paddingLeft: !clipLeft ? left + paddingValue : paddingValue,
    paddingRight: !clipRight ? right + paddingValue : paddingValue,
  };

  return (
    <View style={[styles.container, edges, style]}>
      {dismissKeyboard ? (
        <KeyboardWrapper>{children}</KeyboardWrapper>
      ) : (
        children
      )}
    </View>
  );
};

export default SafeAreaWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.white,
  },
});
