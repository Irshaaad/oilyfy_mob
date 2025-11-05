import React, {useContext} from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {ms, scale} from 'react-native-size-matters';
import {AppThemeContext} from '../../Contexts/ThemeProviders';
import {AppThemeType} from '../../utils/interface';
import {COLORS} from '../../utils/theme';
import CustomIcon from './CustomIcon';
import {TextNormal, TextSmall} from './Texts';

interface CheckboxProps {
  containerStyle?: StyleProp<ViewStyle>;
  label?: string;
  text: string | React.ReactNode;
  textColor?: string;
  value: string;
  onChange: (val: any) => void;
  error?: string | undefined;
}

const Checkbox: React.FC<CheckboxProps> = ({
  containerStyle,
  error,
  onChange,
  value,
  label,
  text,
  textColor,
}): JSX.Element => {
  const {theme} = useContext(AppThemeContext);
  const styles = dynamicStyles(theme);

  const labelVisible = label && value && value.length;

  const handleSelect = () => {
    onChange(value ? false : !!text);
  };

  return (
    // <View style={[containerStyle]}>
    <>
      <View style={[styles.container, containerStyle]}>
        {labelVisible && (
          <TextSmall textStyle={styles.label}>{label}</TextSmall>
        )}
        <TouchableOpacity
          style={[styles.checkboxContainer]}
          onPress={handleSelect}>
          <CustomIcon
            name={value ? 'check-circle' : 'checkbox-blank-circle-outline'}
            type={'material-community'}
            color={value ? COLORS.primary : COLORS.blackGrey}
            size={ms(15)}
          />
          <View style={{flex: 1}}>
            {typeof text === 'string' ? (
              <TextNormal color={textColor || COLORS.black}>{text}</TextNormal>
            ) : (
              text
            )}
          </View>
        </TouchableOpacity>
      </View>
      <TextSmall bold color={'red'}>
        {error && `* ${error}`}
      </TextSmall>
    </>
    // </View>
  );
};

export default Checkbox;

const dynamicStyles = (_theme: AppThemeType) =>
  StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: 'transparent',
      borderRadius: 8,
      height: scale(20),
      maxHeight: 80,
      borderColor: COLORS.borderGrey,
    },
    label: {},
    checkboxContainer: {
      width: '100%',
      gap: scale(3),
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
