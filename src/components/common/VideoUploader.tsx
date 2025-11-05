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
import CustomIcon from './CustomIcon';
import { TextNormal, TextSmall, TextSmaller } from './Texts';

interface VideoUploaderProps {
  value: any;
  onChange: (val: any) => void;
  error?: string | undefined;
  label?: string;
  placeholder?: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = props => {
  const { value = [], onChange, error, label, placeholder } = props;

  const handleVideoPicker = async () => {
    if (value.length >= 5) {
      throw new Error('You can upload upto five photos');
    }
    try {
      const res = await ImageCropPicker.openCamera({
        compressImageQuality: 0.5,
        mediaType: 'video',
      });
      console.log("======[res]=====", JSON.stringify(res, null, 1))
      const filename = res.path.split('/')[res.path.split('/').length - 1]
      const image = {
        url: res.path,
        uri: res.path,
        name: filename,
        type: 'video/mp4',
      }
      let updatedImages = [];
      if (value && value.length) {
        updatedImages = value;
      }
      onChange([...updatedImages, image]);
    } catch (error) {
      console.log(error)
      console.log('===error===>', JSON.stringify(error?.message, null, 1));
    }
  };

  console.log("======[value]=====", JSON.stringify(value, null, 1))
  return (
    <View style={styles.container}>
      <TextNormal>{label}</TextNormal>
      <TextSmall color={COLORS.blackGrey}>VIDEO_FRONT_BRANCH_DOOR</TextSmall>
      <TouchableOpacity
        onPress={handleVideoPicker}
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
          <CustomIcon name={"videocam-outline"} type='ionicons' size={80} />
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
