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
import {useAppDispatch, useAppSelector} from '../../redux/store';
import {utility} from '../../utils/utility';
import {useUpdateProfileMutation} from '../../redux/apis/auth';
import {handleErrorMessage, showSuccessToast} from '../../utils/helpers';
import {setUserData} from '../../redux/reducers/userSlice';

interface ProfileInformationProps {}

export const ProfileInformation: React.FC<ProfileInformationProps> = props => {
  const {} = props;

  const {t} = useTranslation();
  const {name, email_address, id} = useAppSelector(store => store.userSlice);
  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const dispatch = useAppDispatch();

  const {control, handleSubmit} = useForm();
  const [updateProfile, {isLoading}] = useUpdateProfileMutation();

  const onSave = async data => {
    console.log('===data===>', JSON.stringify(data, null, 1));
    try {
      const body = {...data, id};
      delete body.email_address;
      // delete body.whatsapp;
      console.log('===body===>', JSON.stringify(body, null, 1));
      const response = await updateProfile(body).unwrap();
      showSuccessToast(response?.message);
      console.log('===response===>', JSON.stringify(response, null, 1));
      dispatch(setUserData({name: data?.name}));
    } catch (error) {
      handleErrorMessage(error);
    }
  };

  const FIELDS: Field[] = [
    {
      id: '4',
      name: 'name',
      type: 'text',
      defaultValue: name || '',
      label: 'NAME',
      placeholder: 'ENTER_YOUR_NAME',
      rules: {required: {value: true, message: t('THIS_IS_REQUIRED')}},
      // secureTextEntry: true,
    },
    {
      id: '3',
      name: 'email_address',
      type: 'text',
      label: 'EMAIL',
      placeholder: 'ENTER_YOUR_EMAIL',
      defaultValue: email_address || '',
      keyboardType: 'email-address',
      rules: {required: {value: true, message: t('THIS_IS_REQUIRED')}},
      autoCapitalize: 'none',
      editable: false,
    },
    // {
    //   id: '4',
    //   name: 'whatsapp',
    //   type: 'text',
    //   defaultValue: '',
    //   label: 'WHATSAPP',
    //   placeholder: 'ENTER_YOUR_WHATSAPP',
    //   // rules: {required: {value: true, message: t('THIS_IS_REQUIRED')}},
    // },
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
            <TextNormal bold>PROFILE_INFORMATION</TextNormal>
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
              title="SAVE_CHANGES"
              onPress={handleSubmit(onSave)}
              loading={isLoading}
              gradient
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
