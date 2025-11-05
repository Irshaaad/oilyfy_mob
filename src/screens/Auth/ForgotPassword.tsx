/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {ms} from 'react-native-size-matters';
import CustomButtom from '../../components/common/CustomButton';
import CustomIcon from '../../components/common/CustomIcon';
import Fields, {Field} from '../../components/common/Fields';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import {TextNormal} from '../../components/common/Texts';
import {useChangePasswordMutation} from '../../redux/apis/auth';
import {useAppSelector} from '../../redux/store';
import {
  encryptPass,
  handleErrorMessage,
  showSuccessToast,
} from '../../utils/helpers';
import {utility} from '../../utils/utility';

interface ForgotPasswordProps {}

export const ForgotPassword: React.FC<ForgotPasswordProps> = props => {
  const {} = props;

  const {t} = useTranslation();

  const isRTL = useAppSelector(store => store.generalSlice.isRTL);

  const {control, handleSubmit, reset} = useForm();

  const [changePassword, {isLoading}] = useChangePasswordMutation();

  const onSave = async (data: any) => {
    const body = data;
    Object.keys(body).map(key => (body[key] = encryptPass(data[key])));
    try {
      const response = await changePassword(body).unwrap();
      console.log('===response===>', JSON.stringify(response, null, 1));
      reset();
      showSuccessToast(response?.message);
    } catch (error) {
      handleErrorMessage(error);
    }
  };

  const FIELDS: Field[] = [
    {
      id: '4',
      name: 'old_password',
      type: 'text',
      label: 'CURRENT_PASSWORD',
      placeholder: 'ENTER_YOUR_CURRENT_PASSWORD',
      rules: {required: {value: true, message: t('THIS_IS_REQUIRED')}},
      secureTextEntry: true,
    },
    {
      id: '3',
      name: 'new_password',
      type: 'text',
      label: 'NEW_PASSWORD',
      placeholder: 'ENTER_YOUR_NEW_PASSWORD',
      rules: {required: {value: true, message: t('THIS_IS_REQUIRED')}},
      secureTextEntry: true,
    },
    {
      id: '2',
      name: 'confirm_new_password',
      type: 'text',
      label: 'RE-TYPE_NEW_PASSWORD',
      placeholder: 'RE-TYPE_NEW_PASSWORD_AGAIN',
      rules: {required: {value: true, message: t('THIS_IS_REQUIRED')}},
      secureTextEntry: true,
    },
  ];

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={{padding: ms(20), flex: 1, backgroundColor: 'white'}}>
          <View
            style={{
              gap: 10,
              //   height: '10%',
              alignItems: 'center',
              flexDirection: isRTL ? 'row-reverse' : 'row',
            }}>
            <TouchableOpacity onPress={utility.navigation?.goBack}>
              <CustomIcon
                name={isRTL ? 'arrow-right' : 'arrow-left'}
                type="material-community"
                size={ms(22)}
              />
            </TouchableOpacity>
            <TextNormal bold>CHANGE_PASSWORD</TextNormal>
          </View>
          <View
            style={{
              gap: 10,
              height: '90%',
              marginTop: 20,
              //   justifyContent: 'center',
            }}>
            <Fields fields={FIELDS} control={control} />
          </View>
          <View
            style={{
              flex: 0.5,
              justifyContent: 'center',
            }}>
            <CustomButtom
              loading={isLoading}
              title="SAVE_CHANGES"
              gradient
              onPress={handleSubmit(onSave)}
            />
          </View>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
});
