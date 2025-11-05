/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { TextInput } from 'react-native-gesture-handler';
import { ms, scale, vs } from 'react-native-size-matters';
import { COUNTRIES } from '../../utils/constants';
import { COLORS } from '../../utils/theme';
import CustomIcon from './CustomIcon';
import { TextSmall } from './Texts';
import { AppThemeType } from '../../utils/interface';
import { AppThemeContext } from '../../Contexts/ThemeProviders';

interface PhoneInputProps {
  containerStyle?: ViewStyle;
  value: string;
  onChange: (arg: string) => void;
  error?: string
}

const PhoneInput: React.FC<PhoneInputProps> = props => {
  const { containerStyle, value: phoneNumber, onChange } = props;

  const { theme } = useContext(AppThemeContext)
  const styles = dynamicStyles(theme)

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [number, setNumber] = useState(phoneNumber);
  const [items, setItems] = useState(COUNTRIES);

  useEffect(() => {
    if (number) {
      onChange(number);
    }
  }, [number]);

  return (
    <View style={[styles.container, containerStyle]}>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        renderSelectedItem={selected => (
          console.log(selected),
          (
            <View>
              <Image
                source={{
                  uri:
                    COUNTRIES.find(i => i.label === selected)?.flagUrl ||
                    COUNTRIES[0].flagUrl,
                }}
                height={28}
                width={28}
                resizeMode="stretch"
                style={{ borderRadius: 100 }}
              />
            </View>
          )
        )}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        placeholder=""
        onChangeValue={item => {
          const cc = COUNTRIES.find(i => i.label === item)?.countryCode;
          setNumber(cc);
        }}
        // listMode="MODAL"
        searchable
        containerStyle={{
          width: '20%',
          marginBottom: 0,
          alignItems: 'center',
        }}
        style={{
          paddingBottom: 0,
          paddingVertical: 0,
          borderRadius: 15,
          borderWidth: 1,
          borderColor: COLORS.borderGrey,
        }}
        itemSeparator
        itemSeparatorStyle={{ backgroundColor: COLORS.borderGrey }}
        dropDownDirection="BOTTOM"
        dropDownContainerStyle={{
          // backgroundColor: 'white',
          top: vs(45),
          width: scale(320),
          height: scale(300),
          left: 0,
          borderColor: COLORS.borderGrey,
          borderRadius: 12,
          overflow: 'hidden',
          zIndex: 100,
        }}
        renderListItem={props => {
          return (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => props.onPress(props.item)}>
              <View
                style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Image
                  source={{ uri: props.item?.flagUrl }}
                  height={28}
                  width={28}
                  resizeMode="stretch"
                  style={{ borderRadius: 100 }}
                />
                <TextSmall>{props?.label}</TextSmall>
              </View>
              <CustomIcon
                name={
                  !props.isSelected ? 'radio-btn-passive' : 'radio-btn-active'
                }
                color={COLORS.primary}
                type="fontisto"
                size={ms(18)}
              />
            </TouchableOpacity>
          );
        }}
        searchContainerStyle={{
          borderBottomColor: COLORS.borderGrey,
          padding: 0,
        }}
        searchTextInputStyle={{
          height: vs(40),
          fontSize: ms(14),
          // borderColor: COLORS.borderGrey,
          borderWidth: 0,
        }}
        searchPlaceholder="Search a country"
        searchPlaceholderTextColor={COLORS.grey}
      />
      <TextInput
        value={number}
        onChangeText={(txt: string) => setNumber(txt)}
        style={styles.textInput}
        keyboardType="number-pad"
        placeholderTextColor={COLORS.grey}
        placeholder="Enter phone number"
        maxLength={13}
      />
    </View>
  );
};

export default PhoneInput;

const dynamicStyles = (theme: AppThemeType) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    zIndex: 1000,
  },
  textInput: {
    color: COLORS.black,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGrey,
    // width: '100%',
    flex: 1,
    height: vs(40),
    borderRadius: 15,
    fontSize: ms(16),
  },
  item: {
    height: 40,
    overflow: 'hidden',
    flex: 1,
  },
  listItem: {
    flex: 1,
    height: vs(45),
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
