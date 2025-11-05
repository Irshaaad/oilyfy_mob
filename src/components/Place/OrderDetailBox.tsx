import moment from 'moment';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ms} from 'react-native-size-matters';
import CalendarSVG from '../../assets/svgs/calender.svg';
import OilTankSVG from '../../assets/svgs/oiltank.svg';
import {useAppSelector} from '../../redux/store';
import {formatDateTimeString} from '../../utils/helpers';
import {Schedule} from '../../utils/interface';
import {COLORS} from '../../utils/theme';
import {TextNormal, TextSmall} from '../common/Texts';
import {useTranslation} from 'react-i18next';

interface OrderDetailBoxProps {
  schedule: Schedule;
}

export const OrderDetailBox: React.FC<OrderDetailBoxProps> = props => {
  const {schedule} = props;

  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const styles = dynamicStyles(!!isRTL);
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.orderItem}>
        <CalendarSVG />
        <View style={{gap: 5}}>
          <TextSmall bold color={COLORS.blackGrey}>
            SCHEDULED_TIME
          </TextSmall>
          <TextNormal bold>
            {moment(schedule?.date, 'YYYY-MM-DD HH:mm:ss.SSS Z')
              .utc()
              .format('DD-MM-YYYY')}{' '}
            {/* {formatDateTimeString(schedule.time, 'time')} */}
          </TextNormal>
        </View>
      </View>

      <View style={styles.orderItem}>
        <OilTankSVG />
        <View style={{gap: 5}}>
          <TextSmall bold color={COLORS.blackGrey}>
            EXPECTED_OIL_VOLUME
          </TextSmall>
          <TextNormal bold>
            {schedule?.expected_volume} {t('LITRE')}
          </TextNormal>
        </View>
      </View>
    </View>
  );
};

const dynamicStyles = (isRTL: boolean) =>
  StyleSheet.create({
    container: {
      borderWidth: 1,
      borderRadius: 12,
      borderColor: COLORS.blackGrey,
      padding: ms(10),
      backgroundColor: '#F9F9F9',
      gap: 15,
    },
    orderItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 10,
    },
  });
