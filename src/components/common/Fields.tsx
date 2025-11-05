/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  Control,
  Controller,
  FieldValues,
  RegisterOptions,
} from 'react-hook-form';
import Input from './CustomInput';
import PhoneInput from './PhoneInput';
import OTPInput from './OTPInput';
import DateTimePicker from './DateTimePicker';
import CustomDropDown from './CustomDropDown';
import { View, ViewStyle } from 'react-native';
import SelectSwitch from './SelectSwitch';
import { ImageUploader } from './ImageUploader';
import SignatureInput from '../SignatureInput';
import { VideoUploader } from './VideoUploader';

export type Field = {
  name: string;
  autoCapitalize?: string;
  id?: string;
  placeholder?: string;
  keyboardType?: string;
  containerStyle?: ViewStyle | ViewStyle[];
  label?: string;
  secureTextEntry?: boolean;
  rules?: Omit<
    RegisterOptions<FieldValues, string>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  type:
  | 'date'
  | 'text'
  | 'time'
  | 'textarea'
  | 'option'
  | 'radio'
  | 'select-switch'
  | 'phoneNumber'
  | 'image-picker'
  | 'video-picker'
  | 'dropdown'
  | 'signature'
  | string;

  defaultValue?: any;
  suffix?: string;

  disabled?: boolean;

  lists?: { label: string; value: string }[];

  dropdownContainerStyle?: ViewStyle | ViewStyle[];
};

interface FieldsType {
  control: Control<any, any>;
  fields: Field[];
}

const Fields: React.FC<FieldsType> = props => {
  const { control, fields, ...rest } = props;

  return fields.map((i, index) => (
    <Controller
      control={control}
      name={i.name}
      key={i.name}
      defaultValue={i?.defaultValue}
      rules={i?.rules}
      render={({ field, fieldState }) => {
        if (i.type === 'date') {
          return (
            <DateTimePicker
              value={field.value}
              onChange={field.onChange}
              error={fieldState?.error?.message}
              {...i}
            />
          );
        }
        if (i.type === 'time') {
          return (
            <DateTimePicker
              value={field.value}
              mode="time"
              onChange={field.onChange}
              error={fieldState?.error?.message}
              {...i}
            />
          );
        }
        if (i.type === 'phoneNumber') {
          return (
            <View style={{ zIndex: index * 100 }}>
              <PhoneInput
                value={field.value}
                onChange={field.onChange}
                error={fieldState?.error?.message}
                {...i}
              />
            </View>
          );
        }
        if (i.type === 'otp') {
          return (
            <OTPInput
              value={field.value}
              onChange={field.onChange}
              error={fieldState?.error?.message}
              {...i}
            />
          );
        }
        if (i.type === 'dropdown') {
          return (
            <View style={{ zIndex: (fields.length - index) * 100 }}>
              <CustomDropDown
                value={field.value}
                onChange={field.onChange}
                error={fieldState?.error?.message}
                {...i}
              />
            </View>
          );
        }
        if (i.type === 'select-switch') {
          return (
            <View style={{ zIndex: (fields.length - index) * 100 }}>
              <SelectSwitch
                value={field.value}
                onChange={field.onChange}
                error={fieldState?.error?.message}
                {...i}
              />
            </View>
          );
        }
        if (i.type === 'image-picker') {
          return (
            <View style={{ zIndex: (fields.length - index) * 100 }}>
              <ImageUploader
                value={field.value}
                onChange={field.onChange}
                error={fieldState?.error?.message}
                {...i}
              />
            </View>
          );
        }
        if (i.type === 'video-picker') {
          return (
            <View style={{ zIndex: (fields.length - index) * 100 }}>
              <VideoUploader
                value={field.value}
                onChange={field.onChange}
                error={fieldState?.error?.message}
                {...i}
              />
            </View>
          );
        }
        if (i.type === 'signature') {
          return (
            <View style={{ zIndex: (fields.length - index) * 100 }}>
              <SignatureInput
                value={field.value}
                onChange={field.onChange}
                error={fieldState?.error?.message}
                {...i}
              />
            </View>
          );
        }
        return (
          <Input
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState?.error?.message}
            {...i}
          />
        );
      }}
    />
  ));
};

export default Fields;
