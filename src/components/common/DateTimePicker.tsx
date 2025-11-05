/* eslint-disable react-native/no-inline-styles */
import RNDateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import { heightToDP, widthToDP } from 'react-native-responsive-screens';
import { ms, scale, vs } from 'react-native-size-matters';
import Entypo from 'react-native-vector-icons/Entypo';
import { formatDateTimeString } from '../../utils/helpers';
import { COLORS } from '../../utils/theme';
import { TextBig, TextNormal, TextSmall, TextSmaller } from './Texts';
import { useAppSelector } from '../../redux/store';

interface DateTimeProps {
  value: Date;
  onChange: (arg: Date | undefined) => void;
  mode?: 'time' | 'date';
  containerStyle?: ViewStyle;
  error?: string;
  label?: string;
  disabled?: boolean,
  datePickerProps?: DateTimeProps;
  placeholder?: string;
  isFancy?: boolean;
}

const DateTimePicker: React.FC<DateTimeProps> = props => {
  const {
    value,
    onChange,
    containerStyle,
    error,
    isFancy,
    disabled,
    label,
    mode = 'date',
    ...rest
  } = props;
  const [visisble, setVisisble] = useState(false);

  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const styles = dynamicStyles(!!isRTL);

  const handlePress = () => {
    setVisisble(true);
  };

  const onDateChange = (event: any, date?: Date | undefined) => {
    onChange(date);
    Platform.OS === 'android' && setVisisble(false);
  };

  const renderDatePicker = () => (
    <RNDateTimePicker
      value={value ? value : new Date()}
      onChange={onDateChange}
      mode={mode}
      themeVariant="light"
      display="spinner"
      customStyles={{
        datePicker: {
          backgroundColor: '#000000',
        },
      }}
      {...props?.datePickerProps}
    />
  );

  return (
    <View style={containerStyle}>
      {label && <TextSmall textStyle={styles.label}>{label}</TextSmall>}
      {isFancy ? (
        <TouchableOpacity style={styles.fancyContainer} onPress={handlePress}>
          <View style={styles.fancyBox}>
            <TextNormal color={value ? COLORS.black : COLORS.lightgrey}>
              {value ? new Date(value).getDate() : 'DD'}
            </TextNormal>
          </View>
          <View style={styles.fancyBox}>
            <TextNormal color={value ? COLORS.black : COLORS.lightgrey}>
              {value ? new Date(value).getMonth() + 1 : 'MM'}
            </TextNormal>
          </View>
          <View
            style={[
              styles.fancyBox,
              { width: scale(80), alignItems: 'flex-start' },
            ]}>
            <TextNormal color={value ? COLORS.black : COLORS.lightgrey}>
              {value ? new Date(value).getFullYear() : 'YYYY'}
            </TextNormal>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.container, disabled&&{backgroundColor:"#DEDFE4"}]} onPress={handlePress} disabled={disabled}>
          <TextNormal
            color={value ? COLORS.black : COLORS.lightgrey}
          // textStyle={{textAlign: !isRTL ? 'right' : 'left'}}
          >
            {value ? formatDateTimeString(value, mode) : rest?.placeholder}
          </TextNormal>
        </TouchableOpacity>
      )}

      <TextSmaller bold color={'red'} textStyle={{ marginTop: 5 }}>
        {error && `* ${error}`}
      </TextSmaller>

      {Platform.OS === 'ios' ? (
        <ReactNativeModal isVisible={visisble} style={{ alignItems: 'center' }}>
          <View style={styles.datePickerContainer}>
            <View style={styles.modalHeader}>
              <TextBig bold color={COLORS.primary}>
                {mode === 'time' ? 'SELECT_TIME' : 'SELECT_DATE'}
              </TextBig>
              <Entypo
                name="cross"
                color={COLORS.primary}
                size={ms(16)}
                onPress={() => setVisisble(false)}
              />
            </View>
            {renderDatePicker()}
          </View>
        </ReactNativeModal>
      ) : (
        visisble && renderDatePicker()
      )}
    </View>
  );
};

export default DateTimePicker;

const dynamicStyles = (isRTL: boolean) =>
  StyleSheet.create({
    container: {
      // marginTop: 10,
      width: '100%',
      backgroundColor: COLORS.grey,
      borderWidth: 1,
      borderColor: COLORS.borderGrey,
      borderRadius: 8,
      height: heightToDP(5),
      // height: scale(50),
      maxHeight: 60,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: widthToDP(1),
    },
    label: {
      marginBottom: 5,
    },
    textInputContainer: {
      width: '100%',
      alignSelf: 'center',
      borderRadius: 8,
      height: '100%',
    },
    textInput: {
      fontSize: 16,
      paddingLeft: 15,
      flex: 1,
      textAlign: !isRTL ? 'right' : 'left',
    },
    datePickerContainer: {
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 10,
      maxWidth: 400,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    fancyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 5,
    },
    fancyBox: {
      borderWidth: 1,
      borderColor: COLORS.borderGrey,
      borderRadius: 12,
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: scale(55),
      height: vs(45),
    },
  });
