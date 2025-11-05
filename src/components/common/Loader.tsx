import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppThemeType } from '../../utils/interface';
import { AppThemeContext } from '../../Contexts/ThemeProviders';

const LoaderModal = () => {
  const { theme } = useContext(AppThemeContext)
  const styles = dynamicStyles(theme)
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size={'large'} color={'white'} />
    </View>
  );
};

export default LoaderModal;

const dynamicStyles = (theme: AppThemeType) => StyleSheet.create({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10000,
  },
});
