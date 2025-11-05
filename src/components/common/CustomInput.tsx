import React, { useRef, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { heightToDP, widthToDP } from 'react-native-responsive-screens';
import { scale } from 'react-native-size-matters';
import { useAppSelector } from '../../redux/store';
import { COLORS } from '../../utils/theme';
import { utility } from '../../utils/utility';
import CustomIcon from './CustomIcon';
import { TextNormal, TextSmall, TextSmaller } from './Texts';

interface InputProps extends TextInputProps {
  textInputContainerStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  textInputStyle?: StyleProp<TextStyle>;
  label?: string;
  suffix?: string;
  error?: string | undefined;
  icon?: any;
}

const Input: React.FC<InputProps> = ({
  textInputContainerStyle,
  textInputStyle,
  containerStyle,
  error,
  secureTextEntry,
  onChangeText,
  value,
  label,
  suffix,
  icon,
  ...restProps
}: InputProps): JSX.Element => {
  const textRef = useRef(null);
  const [isVisible, setIsVisible] = useState<boolean | undefined>(
    !!secureTextEntry,
  );

  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const styles = dynamicStyles(!!isRTL);

  const labelVisible = !!label;

  return (
    <View style={[{ gap: 5 }, containerStyle]}>
      {labelVisible && (
        <TextNormal textStyle={styles.label}>{label}</TextNormal>
      )}
      <View style={[styles.container]}>
        <View style={[styles.textInputContainer, textInputContainerStyle]}>
          <CustomIcon {...icon} />
          <TextInput
            ref={textRef}
            value={value}
            style={[styles.textInput, textInputStyle]}
            onChangeText={(text: string) => onChangeText(text.trim())}
            placeholderTextColor={COLORS.blackGrey}
            secureTextEntry={isVisible}
            keyboardType={restProps?.keyboardType}
            editable={restProps?.editable}
            placeholder={
              restProps?.placeholder &&
              utility.translate(restProps?.placeholder)
            }
          />
          {!!secureTextEntry && (
            <View
              style={{
                // position: 'absolute',
                right: 5,
                // top: !labelVisible ? 15 : -3.1,
              }}>
              <CustomIcon
                name={isVisible ? 'eye-outline' : 'eye-off-outline'}
                type="ionicons"
                color={COLORS.blackGrey}
                onPress={() => setIsVisible(p => !p)}
                size={scale(16)}
              />
            </View>
          )}
          {!!suffix && (
            <View
              style={{
                // position: 'absolute',
                right: 5,
                // top: !labelVisible ? 15 : -3.1,
              }}>
              <TextSmall bold textStyle={{ marginRight: 10 }}>{suffix}</TextSmall>
            </View>
          )}
        </View>
      </View>
      <TextSmaller bold color={'red'}>
        {error && `* ${error}`}
      </TextSmaller>
    </View>
  );
};

export default Input;

const dynamicStyles = (isRTL: boolean) =>
  StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: 'transparent',
      borderRadius: 8,
      height: heightToDP(5),
      minHeight: 35,
      maxHeight: 80,
      borderWidth: 1,
      // paddingHorizontal: widthToDP(1.2),
      borderColor: COLORS.borderGrey,
    },
    label: {},
    textInputContainer: {
      width: '100%',
      borderRadius: 8,
      backgroundColor: COLORS.grey,
      flex: 1,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    textInput: {
      fontSize: RFValue(11),
      paddingHorizontal: widthToDP(1),
      paddingVertical: 0,
      paddingTop: 0,
      flex: 1,
      height: '100%',
      color: COLORS.black,
      textAlign: isRTL ? 'right' : 'left',
    },
  });
