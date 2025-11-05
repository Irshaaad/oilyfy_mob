/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Alert, StyleSheet, TouchableOpacity, View} from 'react-native';
import {heightToDP, widthToDP} from 'react-native-responsive-screens';
import {ms, scale} from 'react-native-size-matters';
import {useMoveToDailyMutation} from '../../redux/apis/schedules';
import {useAppSelector} from '../../redux/store';
import {STATUS, STATUS_COLOR} from '../../utils/constants';
import {
  checkIfLocationEnabled,
  handleErrorMessage,
  onPressWhatsapp,
} from '../../utils/helpers';
import {Schedule} from '../../utils/interface';
import {COLORS} from '../../utils/theme';
import {utility} from '../../utils/utility';
import CustomButton from '../common/CustomButton';
import CustomIcon from '../common/CustomIcon';
import {TextNormal, TextSmaller} from '../common/Texts';

interface TripProps {
  item: Schedule;
  isUrgent: boolean;
  onSelectTrip: (item: Schedule) => void;
  isSelected: boolean;
  addToTrips: () => void;
}

export const Trip: React.FC<TripProps> = React.memo(props => {
  const {item, onSelectTrip, isUrgent, isSelected, addToTrips} = props;

  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const isCurrentTrip = useAppSelector(
    store => store.generalSlice.isCurrentTrip,
  );
  const styles = dynamicStyles(!!isRTL);

  const onPressOpen = () => {
    onSelectTrip(item);
  };

  const onPressNav = async () => {
    const res = await checkIfLocationEnabled();
    if (!res) {
      return Alert.alert('Location not Enabled', 'Please enable your location');
    }
    utility.navigation?.navigate('ViewLocation', {schedule: item});
  };

  const [moveToDaily, {isLoading}] = useMoveToDailyMutation();

  const onPressUrgent = async () => {
    try {
      const response = await moveToDaily({id: item.id}).unwrap();
      console.log('===response===>', JSON.stringify(response, null, 1));
    } catch (error) {
      handleErrorMessage(error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        !isUrgent &&
          isSelected && {backgroundColor: 'rgba(19, 173, 127, 0.11)'},
      ]}>
      <View style={{gap: 5, width: '100%'}}>
        <View
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            // justifyContent: 'space-between',
          }}>
          <View style={{width: scale(28)}}>
            {item.status == 'INCOMPLETE' && !isUrgent && !isCurrentTrip && (
              <CustomIcon
                name={
                  isSelected
                    ? 'radio-button-on-sharp'
                    : 'radio-button-off-sharp'
                }
                type="ionicons"
                size={ms(18)}
                color={COLORS.primary}
                style={{padding: 5}}
                onPress={addToTrips}
              />
            )}
          </View>
          <View style={{gap: 5, paddingTop: heightToDP(1.5), width: '90%'}}>
            <TextNormal bold numberOfLines={2} adjustsFontSizeToFit={false}>
              {item?.branch?.name || 'N/A'}
            </TextNormal>
            <View
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                gap: 2,
                alignItems: 'center',
              }}>
              <CustomIcon
                type={'ionicons'}
                name={'location-outline'}
                color={COLORS.darkGrey}
                size={ms(12)}
              />
              <TextNormal color={COLORS.black} bold>
                {item?.branch?.restaurant?.name || 'N/A'}
              </TextNormal>
            </View>
            {item?.branch?.Branch_Admin?.whatsapp && (
              <TouchableOpacity
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  gap: 2,
                  alignItems: 'center',
                }}
                onPress={() =>
                  onPressWhatsapp(item?.branch?.Branch_Admin?.whatsapp)
                }>
                <CustomIcon
                  type={'ionicons'}
                  name={'logo-whatsapp'}
                  color={'green'}
                  size={ms(12)}
                />
                <TextNormal bold color={COLORS.green}>
                  {item.branch.Branch_Admin?.whatsapp}
                </TextNormal>
              </TouchableOpacity>
            )}
            <View
              style={{flexDirection: isRTL ? 'row-reverse' : 'row', gap: 5}}>
              {item?.is_urgent ? (
                <TextSmaller color={COLORS.primary}>URGENT</TextSmaller>
              ) : null}
              <TextSmaller color={STATUS_COLOR[item.status]}>
                {STATUS[item.status]}
              </TextSmaller>
            </View>
          </View>
        </View>
        <View style={styles.btnContainer}>
          <CustomButton
            containerStyle={{borderRadius: 10}}
            width={'45%'}
            onPress={onPressOpen}
            gradient
            title="OPEN"
            disabled={isLoading}
          />
          <CustomButton
            containerStyle={{borderRadius: 10, backgroundColor: COLORS.grey}}
            width={'45%'}
            title={isUrgent ? 'URGENT' : 'NAVIGATE'}
            disabled={item.status === 'COMPLETED'}
            loading={isLoading}
            onPress={isUrgent ? onPressUrgent : onPressNav}
            tirtiary
          />
        </View>
      </View>
    </View>
  );
});

const dynamicStyles = (isRTL: boolean) =>
  StyleSheet.create({
    container: {
      borderWidth: 1,
      borderRadius: 12,
      backgroundColor: COLORS.grey,
      borderColor: COLORS.borderGrey,
    },
    btnContainer: {
      paddingHorizontal: widthToDP(1.8),
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-evenly',
      marginTop: heightToDP(2.5),
      paddingBottom: heightToDP(1.5),
      // marginBottom: heightToDP(0.5),
    },
  });
