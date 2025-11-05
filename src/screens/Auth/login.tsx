import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StatusBar, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { ms } from 'react-native-size-matters';
import LogoSVG from '../../assets/svgs/oilfy-white.svg';
import { AuthWrapper } from '../../components/BackgroundWrappers/AuthWrapper';
import CustomButton from '../../components/common/CustomButton';
import Fields, { Field } from '../../components/common/Fields';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import { TextBigger, TextSmall } from '../../components/common/Texts';
import { useLoginMutation } from '../../redux/apis/auth';
import { setAccessToken } from '../../redux/reducers/generalSlice';
import { setUserData } from '../../redux/reducers/userSlice';
import { useAppDispatch } from '../../redux/store';
import {
  encryptPass,
  handleErrorMessage,
  showSuccessToast,
} from '../../utils/helpers';
import { LoginResponseType } from '../../utils/interface';
import { COLORS } from '../../utils/theme';
import { utility } from '../../utils/utility';

interface LoginProps { }
type LoginForm = {
  email_address: string;
  password: string;
};

export const Login: React.FC<LoginProps> = props => {
  const { } = props;
  const { control, handleSubmit } = useForm<LoginForm>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const keyboard = useAnimatedKeyboard();
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboard.height.value }],
  }));

  const [login, { isLoading, error: loginError }] = useLoginMutation();

  if (loginError) {
    console.log('===loginError===>', JSON.stringify(loginError, null, 1));
  }

  const onLogin = async (data: LoginForm) => {
    if (!data?.email_address || !data?.password) {
      return utility.showToast?.show(
        'Please add your valid email and password',
        {
          type: 'danger',
        },
      );
    }
    try {
      const password = encryptPass(data?.password);
      data.password = password;
      const response: LoginResponseType = await login(data).unwrap();
      showSuccessToast('Login successfull');
      dispatch(setAccessToken(response.session.jwt_token));
      dispatch(setUserData(response.user));
      utility.replaceScreen(utility.navigation, 'Home');
    } catch (error) {
      error && handleErrorMessage(error);
    }
  };

  const Login_FIELDS: Field[] = [
    {
      id: '3',
      name: 'email_address',
      type: 'text',
      label: 'EMAIL',
      placeholder: 'ENTER_YOUR_EMAIL',
      // defaultValue: 'driver@company.com',
      keyboardType: 'email-address',
      rules: {
        required: { value: true, message: t('THIS_IS_REQUIRED') },
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, // Email regex pattern
          message: "INVALID_EMAIL_ADDRESS" // Custom message for invalid pattern
        }
      },
      autoCapitalize: 'none',
    },
    {
      id: '4',
      name: 'password',
      type: 'text',
      // defaultValue: '@@Power2me',
      label: 'PASSWORD',
      placeholder: 'ENTER_YOUR_PASSWORD',
      rules: { required: { value: true, message: t('THIS_IS_REQUIRED') } },
      secureTextEntry: true,
    },
  ];

  return (
    <Animated.View style={[animatedStyles, { flex: 1 }]}>
      <AuthWrapper>
        <StatusBar backgroundColor={'black'} barStyle={'light-content'} />
        <SafeAreaWrapper
          style={styles.container}
          clipTop
          clipBottom
          dismissKeyboard>
          <View style={styles.contentContainer}>
            <View style={styles.imageContainer}>
              {/* <CustomImage source={IMAGES.trucks} /> */}
              <LogoSVG />
            </View>
            {/* <ScrollView
              // scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{flex: 1}}> */}
            <View style={{ padding: ms(20), flex: 1, backgroundColor: 'white' }}>
              <View style={{ gap: 10, height: '10%' }}>
                <TextBigger bold>WELCOME_BACK</TextBigger>
                <TextSmall color={COLORS.blackGrey}>
                  LOGIN_WITH_YOUR_DETAILS
                </TextSmall>
              </View>
              <View
                style={{
                  gap: 10,
                  height: '90%',
                  justifyContent: 'center',
                }}>
                <Fields fields={Login_FIELDS} control={control} />
                {/* <TextNormal right bold>
              FORGOT_PASSWORD
            </TextNormal> */}
                <View
                  style={{
                    flex: 0.5,
                    justifyContent: 'center',
                  }}>
                  <CustomButton
                    title="LOGIN"
                    gradient
                    loading={isLoading}
                    onPress={handleSubmit(onLogin)}
                  />
                </View>
              </View>
            </View>
            {/* </ScrollView> */}
          </View>
        </SafeAreaWrapper>
      </AuthWrapper>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
  },

  imageContainer: {
    width: '100%',
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
