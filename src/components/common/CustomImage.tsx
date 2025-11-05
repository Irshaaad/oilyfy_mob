import React, {useContext, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
// import FastImage from 'react-native-fast-image';
import {AppThemeContext} from '../../Contexts/ThemeProviders';
import {AppThemeType} from '../../utils/interface';

interface CustomImageProps {
  source: {uri: string} | number;
  imgStyle?: ImageStyle;
  containerStyle?: ViewStyle;
  onPress?: () => void;
  height?: number;
  width?: any;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

const CustomImage: React.FC<CustomImageProps> = props => {
  const {containerStyle, onPress, imgStyle, height, width, source, resizeMode} =
    props;

  const {theme} = useContext(AppThemeContext);
  const styles = dynamicStyles(theme);

  const disabled = typeof onPress !== 'function';
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onLoadStart = () => setIsLoading(true);
  const onLoadEnd = () => setIsLoading(false);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        containerStyle,
        height ? {height} : null,
        width ? {width} : null,
      ]}
      disabled={disabled}
      onPress={onPress}>
      <Image
        source={source}
        style={[styles.img, imgStyle as any]}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        resizeMode={resizeMode || 'stretch'}
      />
      {isLoading && (
        <ActivityIndicator
          size="large"
          // color={COLORS.primary}
          style={styles.loader}
        />
      )}
    </TouchableOpacity>
  );
};

export default CustomImage;

const dynamicStyles = (_theme: AppThemeType) =>
  StyleSheet.create({
    container: {height: 100, width: 100},
    img: {height: '100%', width: '100%'},
    loader: {position: 'absolute', top: 0, right: 0, left: 0, bottom: 0},
  });
