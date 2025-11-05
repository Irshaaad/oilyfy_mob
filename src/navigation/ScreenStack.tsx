import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {useAppSelector} from '../redux/store';
import {
  Account,
  AllSchedulNavigation,
  Home,
  Login,
  ViewLocation,
  ForgotPassword,
  ProfileInformation,
} from '../screens';

interface ScreenStackInterface {}

const Stack = createStackNavigator();

const ScreenStack: React.FC<ScreenStackInterface> = props => {
  const {} = props;

  const accessToken = useAppSelector(store => store?.generalSlice.accessToken);

  console.log('===accessToken===>', JSON.stringify(accessToken, null, 1));

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // animation: 'slide_from_right',
        // animationTypeForReplace: 'push',
        // detachPreviousScreen: true,
        // cardShadowEnabled: false,
        transitionSpec: {
          open: {animation: 'timing', config: {delay: 0, duration: 150}},
          close: {animation: 'timing', config: {delay: 0, duration: 150}},
        },
      }}
      initialRouteName={accessToken ? 'Home' : 'Login'}>
      <Stack.Screen name={'Login'} component={Login} />
      <Stack.Screen name={'Home'} component={Home} />
      <Stack.Screen name={'Account'} component={Account} />
      <Stack.Screen name={'ViewLocation'} component={ViewLocation} />
      <Stack.Screen
        name={'ProfileInformation'}
        component={ProfileInformation}
      />
      <Stack.Screen name={'ForgotPassword'} component={ForgotPassword} />
      <Stack.Screen
        name={'AllSchedulNavigation'}
        component={AllSchedulNavigation}
      />
    </Stack.Navigator>
  );
};

export default ScreenStack;
