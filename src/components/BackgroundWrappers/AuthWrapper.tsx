import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {IMAGES} from '../../assets';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = props => {
  const {children} = props;

  return (
    <View style={styles.container}>
      <Image
        source={IMAGES.background}
        style={{height: '100%', width: '100%'}}
      />
      <View style={styles.hoverWrapper}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hoverWrapper: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
});
