/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ms } from 'react-native-size-matters';
import { useAppSelector } from '../../redux/store';
import { onPressWhatsapp } from '../../utils/helpers';
import { Schedule } from '../../utils/interface';
import { COLORS } from '../../utils/theme';
import CustomIcon from '../common/CustomIcon';
import { TextNormal, TextSmall } from '../common/Texts';

interface PlaceBarProps {
  imageSource: { uri: string } | number;
  schedule: Schedule;
}

export const PlaceBar: React.FC<PlaceBarProps> = props => {
  const { imageSource, schedule } = props;

  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const styles = dynamicStyles(!!isRTL);

  return (
    <View
      style={{
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <View style={styles.container}>
        <Image source={imageSource} style={styles.image} />
        <View style={styles.textContainer}>
          <TextNormal bold>{schedule?.branch?.name}</TextNormal>
          <View
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: 2,
            }}>
            <CustomIcon
              type="ionicons"
              name={'location-outline'}
              color={COLORS.blackGrey}
              size={ms(12)}
            />
            <TextNormal bold>
              {schedule?.branch?.restaurant?.name}
            </TextNormal>
          </View>
          {schedule.branch?.Branch_Admin?.whatsapp && (
            <TouchableOpacity
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                gap: 2,
                alignItems: 'center',
              }}
              onPress={() =>
                onPressWhatsapp(schedule.branch?.Branch_Admin?.whatsapp)
              }>
              <CustomIcon
                type={'ionicons'}
                name={'logo-whatsapp'}
                color={'green'}
                size={ms(12)}
              />
              <TextNormal bold color={COLORS.green}>
                {schedule.branch.Branch_Admin?.whatsapp}
              </TextNormal>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <TouchableOpacity
        onPress={() => onPressWhatsapp(schedule.branch.Branch_Admin.whatsapp)}
        style={{ right: 10 }}>
        <CustomIcon name={'logo-whatsapp'} color="green" type="ionicons" />
      </TouchableOpacity>
    </View>
  );
};

const dynamicStyles = (isRTL: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      gap: 10,
    },
    textContainer: {
      // gap: 10,
    },
    image: {},
  });
