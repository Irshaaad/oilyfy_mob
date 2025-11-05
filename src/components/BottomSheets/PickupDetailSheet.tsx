import React, {RefObject} from 'react';
import {StyleSheet, View} from 'react-native';
import {heightToDP} from 'react-native-responsive-screens';
import {IMAGES} from '../../assets';
import TubeSVG from '../../assets/svgs/tube.svg';
import {useAppSelector} from '../../redux/store';
import {Schedule} from '../../utils/interface';
import {COLORS} from '../../utils/theme';
import {utility} from '../../utils/utility';
import BottomViewWrapper from '../common/BottomViewWrapper';
import CustomButton from '../common/CustomButton';
import {TextNormal} from '../common/Texts';
import {OrderDetailBox} from '../Place/OrderDetailBox';
import {PlaceBar} from '../Place/PlaceBar';
import {BottomSheetModal} from '@gorhom/bottom-sheet';

interface PickupDetailSheetProps {
  isOpen: boolean;
  hideNavigate?: boolean;
  closeSheet: () => void;
  handlePickup: (item: Schedule) => void;
  schedule: Schedule;
  bottomSheetRef?: RefObject<BottomSheetModal>;
  nearbySchedule?: Schedule;
}

export const PickupDetailSheet: React.FC<PickupDetailSheetProps> = React.memo(
  props => {
    const {
      isOpen,
      schedule,
      closeSheet,
      bottomSheetRef,
      hideNavigate = false,
      handlePickup,
      nearbySchedule,
    } = props;

    const isRTL = useAppSelector(store => store.generalSlice.isRTL);
    const styles = dynamicStyles(!!isRTL);

    const isPickupVisible =
      !!nearbySchedule &&
      nearbySchedule?.id === schedule?.id &&
      (schedule?.status === 'INCOMPLETE' ||
        nearbySchedule?.status === 'INCOMPLETE');

    return (
      <BottomViewWrapper
        isVisible={isOpen}
        bottomSheetRef={bottomSheetRef}
        closeSheet={() => {
          closeSheet();
        }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TextNormal bold>PICKUP_DETAILS</TextNormal>
          </View>
          <View style={styles.contentContainer}>
            <PlaceBar imageSource={IMAGES.crane} schedule={schedule} />
            {schedule?.to_be_tested ? (
              <View style={styles.collectTube}>
                <TubeSVG />
                <TextNormal bold color={COLORS.red}>
                  PLEASE_COLLECT_OIL_SAMPLE
                </TextNormal>
              </View>
            ) : null}
            <OrderDetailBox schedule={schedule} />
            <View style={styles.btnContainer}>
              {hideNavigate && (
                <CustomButton
                  title="NAVIGATE"
                  disabled={schedule?.status == 'COMPLETED'}
                  width={isPickupVisible ? '48%' : '100%'}
                  tirtiary
                  onPress={() => {
                    closeSheet();
                    setTimeout(() => {
                      utility.navigation?.navigate('ViewLocation', {
                        schedule,
                      });
                    }, 100);
                  }}
                />
              )}
              {isPickupVisible && (
                <CustomButton
                  title="PICKUP"
                  width={!hideNavigate ? '100%' : '48%'}
                  onPress={() => {
                    closeSheet();
                    handlePickup(schedule);
                  }}
                />
              )}
            </View>
          </View>
        </View>
      </BottomViewWrapper>
    );
  },
);

const dynamicStyles = (isRTL: boolean) =>
  StyleSheet.create({
    container: {
      // height: '55%',
      // maxHeight: 225,
      // backgroundColor: 'grey',
      gap: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    contentContainer: {
      // justifyContent: 'space-between',
      // flex: 1,
      // backgroundColor: 'red',
      gap: 12,
      // paddingVertical: heightToDP(2)
    },
    sendReportButton: {
      backgroundColor: COLORS.blue,
      marginBottom: heightToDP(11),
    },
    collectTube: {
      borderColor: COLORS.red,
      borderWidth: 1,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      flexDirection: 'row',
      height: heightToDP(5),
      backgroundColor: '#FFE5E5',
    },
    btnContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // backgroundColor: 'pink',
    },
  });
