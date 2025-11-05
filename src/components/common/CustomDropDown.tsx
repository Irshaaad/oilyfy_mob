/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useEffect, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Modal from 'react-native-modal';
import { heightToDP } from 'react-native-responsive-screens';
import { ms, scale, vs } from 'react-native-size-matters';
import { AppThemeContext } from '../../Contexts/ThemeProviders';
import { AppThemeType } from '../../utils/interface';
import { COLORS, FONTS } from '../../utils/theme';
import { utility } from '../../utils/utility';
import { TextNormal, TextSmaller } from './Texts';

interface CustomDropDownProps {
  containerStyle?: StyleProp<ViewStyle>;
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  isAlwaysOpen?: boolean;
  multiple?: boolean;
  error?: string | undefined;
  dropDownType?: 'DEFAULT' | 'FLATLIST' | 'SCROLLVIEW' | 'MODAL';
  value: any;
  onChange: (arg: any) => void;
  lists?: { label: string; value: string }[];
  searchPlaceholder?: string;
  dropdownContainerStyle?: ViewStyle | ViewStyle[]
}

const CustomDropDown: React.FC<CustomDropDownProps> = ({
  containerStyle,
  error,
  searchable,
  onChange,
  placeholder,
  isAlwaysOpen,
  multiple,
  searchPlaceholder,
  dropDownType = 'FLATLIST',
  value = null,
  label,
  lists,
  dropdownContainerStyle,
}: CustomDropDownProps): JSX.Element => {
  const labelVisible = !!label;

  const [open, setOpen] = useState(false);
  const [val, setValue] = useState(value);
  const [items, setItems] = useState(
    lists || [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' },
    ],
  );

  useEffect(() => {
    if (val) {
      onChange(val);
    }
  }, [val]);

  const [modalVisible, setModalVisible] = useState(false);

  const renderModal = (children: any) => {
    return (
      <Modal
        isVisible={modalVisible}
        animationIn={'slideInUp'}
        animationOut={'fadeOut'}
        style={{
          flex: 1,
          margin: 0,
          justifyContent: 'flex-end',
          paddingHorizontal: scale(10),
          paddingBottom: vs(40),
        }}>
        <View
          style={{
            minHeight: 120,
            backgroundColor: COLORS.white,
            borderRadius: 12,
          }}>
          {children}
        </View>
      </Modal>
    );
  };

  const { theme } = useContext(AppThemeContext)
  const styles = dynamicStyles(theme)

  return (
    // <View style={[containerStyle]}>
    <View style={{ zIndex: 10000 }}>
      <View style={[styles.container, containerStyle]}>
        {labelVisible && (
          <TextNormal color={COLORS.black}>{label}</TextNormal>
        )}
        <View>
          <DropDownPicker
            open={isAlwaysOpen || open}
            value={val}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            multiple={multiple}
            setItems={setItems}
            onOpen={() => dropDownType === 'MODAL' && setModalVisible(true)}
            onSelectItem={() =>
              dropDownType === 'MODAL' && setModalVisible(false)
            }
            placeholder={placeholder ? utility.translate(placeholder) : ''}
            placeholderStyle={{ color: COLORS.lightgrey }}
            listMode={dropDownType}
            searchable={searchable}
            itemSeparator
            itemSeparatorStyle={{ backgroundColor: COLORS.borderGrey }}
            dropDownDirection="BOTTOM"
            searchPlaceholder={searchPlaceholder ? utility.translate(searchPlaceholder) : ""}
            searchPlaceholderTextColor={COLORS.grey}
            style={{
              paddingBottom: 0,
              paddingVertical: 0,
              paddingLeft: 20,
              minHeight: heightToDP(5),
              borderRadius: 12,
              borderWidth: 1,
              borderColor: COLORS.borderGrey,
              top: 5,
            }}
            textStyle={{ fontFamily: FONTS['sf-pro-display'].reqular, color: "black" }}
            containerStyle={{
              //   width: '20%',
              marginBottom: 0,
              alignItems: 'center',
            }}
            dropDownContainerStyle={{
              backgroundColor: 'white',
              // top: vs(45),
              // width: scale(320),
              left: 0,
              borderColor: COLORS.borderGrey,
              borderRadius: 12,
              overflow: 'hidden',
              zIndex: 100,
              ...dropdownContainerStyle
            }}
            // renderListItem={dropDownType === "MODAL" ? (props => {
            renderListItem={true ? (props => {
              return (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => props.onPress(props.item)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 10,
                      alignItems: 'center',
                    }}>
                    <TextNormal color={'black'}>{utility.translate(props?.label)}</TextNormal>
                  </View>
                </TouchableOpacity>
              );
            }) : null}
            searchContainerStyle={{
              borderBottomColor: COLORS.borderGrey,
            }}
            searchTextInputStyle={{
              height: vs(40),
              fontSize: ms(14),
              borderColor: COLORS.borderGrey,
            }}
            renderModal={(listComponent: any) => renderModal(listComponent)}
          />
        </View>
      </View>
      <TextSmaller bold color={'red'}>
        {error && `* ${error}`}
      </TextSmaller>
    </View>
  );
};

export default CustomDropDown;

const dynamicStyles = (theme: AppThemeType) => StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    maxHeight: 80,
  },
  label: {
    color: COLORS.black
  },

  item: {
    height: 40,
    overflow: 'hidden',
    flex: 1,
  },
  listItem: {
    flex: 1,
    height: vs(30),
    // padding: 10,
    paddingHorizontal: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
