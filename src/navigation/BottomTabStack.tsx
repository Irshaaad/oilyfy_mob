/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useContext } from 'react';
import BarcodeSVG from '../assets/images/barcode.svg';
import ClockSVG from '../assets/images/clock.svg';
import HeartSVG from '../assets/images/heart.svg';
import UserSVG from '../assets/images/user.svg';
import { TextSmall } from '../components/common/Texts';
import { AppThemeContext } from '../Contexts/ThemeProviders';
import { Login } from '../screens';
import { COLORS } from '../utils/theme';
import { TabList, TabStackParamList } from './interface';

const Tab = createBottomTabNavigator<TabStackParamList>();

const TABS: TabList[] = [
  {
    id: 1,
    label: 'Scan',
    icon: (props: any) => <BarcodeSVG {...props} />,
    component: Login,
  },
  {
    id: 2,
    label: 'History',
    icon: (props: any) => <ClockSVG {...props} />,
    component: Login,
  },
  {
    id: 1,
    label: 'Favourite',
    component: Login,
    icon: (props: any) => <HeartSVG {...props} />,
  },
  {
    id: 1,
    label: 'Profile',
    component: Login,
    icon: (props: any) => <UserSVG {...props} />,
  },
];

const BottomTabStack: React.FC = () => {

  const { theme } = useContext(AppThemeContext)

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.secondary,
          borderTopColor: '#DCDBCD',
          borderTopWidth: 1,
        },
      }}>
      {TABS.map(tab => (
        <Tab.Screen
          key={tab.id}
          name={tab.label as never}
          component={tab.component}
          options={{
            tabBarIcon: ({ focused, color, size }) =>
              tab.icon({ color: focused ? COLORS.primary : COLORS.grey }),
            tabBarLabel: ({ children, focused, position }) => (
              <TextSmall
                bold={focused}
                color={focused ? COLORS.primary : COLORS.grey}>
                {children}
              </TextSmall>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default BottomTabStack;
