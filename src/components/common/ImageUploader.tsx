/* eslint-disable no-catch-shadow */
/* eslint-disable @typescript-eslint/no-shadow */
import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { heightToDP } from 'react-native-responsive-screens';
import { COLORS } from '../../utils/theme';
import { TextNormal, TextSmall, TextSmaller } from './Texts';
import CustomIcon from './CustomIcon';

interface ImageUploaderProps {
  value: any;
  onChange: (val: any) => void;
  error?: string | undefined;
  label?: string;
  placeholder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = props => {
  const { value = [], onChange, error, label, placeholder } = props;

  const handleImagePicker = async () => {
    if (value.length >= 5) {
      throw new Error('You can upload upto five photos');
    }
    try {
      const res = await ImageCropPicker.openCamera({
        multiple: true,
        compressImageQuality: 0.5,
        forceJpg: true,
        includeBase64: true,
        mediaType: 'photo',
        maxFiles: 5,
      });
      console.log("======[res]=====", JSON.stringify(res, null, 1))
      if (res.length) {
        const images = res.map(img => ({
          type: img.mime,
          base64: img.data,
          url: img.path,
          name: img.filename,
        }));
        let updatedImgs = [];
        if (value && value.length) {
          updatedImgs = value;
        }
        onChange([...updatedImgs, ...images]);
      } else {
        const image = {
          type: res.mime,
          base64: res.data,
          url: res.path,
          name: res.filename,
        };
        let updatedImages = [];
        if (value && value.length) {
          updatedImages = value;
        }
        onChange([...updatedImages, image]);
      }
    } catch (error) {
      console.log('===error===>', JSON.stringify(error?.message, null, 1));
    }
  };
  return (
    <View style={styles.container}>
      <TextNormal>{label}</TextNormal>
      <TextSmall color={COLORS.blackGrey}>TAKE_IMAGES_WITH_LIGHT</TextSmall>
      <TouchableOpacity
        onPress={handleImagePicker}
        style={[styles.contentContainer, !value && { justifyContent: 'center' }]}>
        {!value ? (
          <TextSmall color={COLORS.blackGrey}>{placeholder}</TextSmall>
        ) : value && value.length ? (
          <View style={styles.imageContainer}>
            {value.map(val => (
              <Image source={{ uri: val?.url }} style={styles.image} />
            ))}
          </View>
        ) : (
          <CustomIcon name={"image-outline"} type='ionicons' size={80} />
        )}
      </TouchableOpacity>
      <TextSmaller color={'red'}>{error && `* ${error}`}</TextSmaller>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 1,
    // height: 100,
  },
  contentContainer: {
    minHeight: heightToDP(5),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGrey,
    paddingHorizontal: 10,
    padding: 5,
    backgroundColor: COLORS.grey,
  },
  image: {
    height: 70,
    width: 70,
    borderRadius: 8,
  },
  imageContainer: {
    flexDirection: 'row',
    gap: 10,
  },
});
