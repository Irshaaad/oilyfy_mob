/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react';
import { Keyboard, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { TextSmall, TextSmaller } from './Texts';

import OtpInputs from 'react-native-otp-inputs';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../utils/theme';
import { AppThemeContext } from '../../Contexts/ThemeProviders';
import { AppThemeType } from '../../utils/interface';

interface OTPInputProps {
  value: string;
  onChange: (arg: string) => void;
  onFilled?: (arg?: string) => void;
  error?: string;
  label?: string;
  numberOfInputs?: number;
  containerStyles?: StyleProp<ViewStyle>;
}

const OTPInput: React.FC<OTPInputProps> = props => {
  const {
    label,
    containerStyles,
    value,
    onChange,
    numberOfInputs,
    onFilled,
    error,
  } = props;

  const { theme } = useContext(AppThemeContext)
  const styles = dynamicStyles(theme)

  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (
      typeof onFilled === 'function' &&
      value &&
      (value?.length === numberOfInputs || value?.length === 6) &&
      trigger
    ) {
      setTrigger(false);
      Keyboard.dismiss();
      onFilled(value);
    }
  }, [numberOfInputs, value, trigger]);

  useEffect(() => {
    if (value?.length === numberOfInputs || (value?.length === 6 && !trigger)) {
      setTrigger(true);
    }
  }, [value]);

  return (
    <>
      <View style={[styles.container, containerStyles]}>
        {label && <TextSmall>{label}</TextSmall>}
        <OtpInputs
          defaultValue={value}
          handleChange={code => onChange(code)}
          numberOfInputs={numberOfInputs ?? 6}
          autofillFromClipboard={false}
          style={styles.otpStyles}
          inputStyles={styles.otpInput}
        />
      </View>
      {error && (
        <TextSmaller bold color={'red'}>
          {'* '}
          {error}
        </TextSmaller>
      )}
    </>
  );
};

export default OTPInput;

const dynamicStyles = (theme: AppThemeType) => StyleSheet.create({
  container: { width: '100%', height: scale(75) },
  otpStyles: {
    width: '100%',
    paddingTop: scale(10),
    flexDirection: 'row',
    flex: 1,
    gap: 10,
  },
  otpInput: {
    backgroundColor: 'transparent',
    width: scale(50),
    height: scale(50),
    fontSize: scale(16),
    textAlign: 'center',
    borderRadius: 10,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
});
