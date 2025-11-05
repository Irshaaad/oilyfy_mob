import { CommonActions, NavigationProp, StackActions } from '@react-navigation/native';
import { ToastType } from 'react-native-toast-notifications';
import { DispatchProp } from 'react-redux';

type Utility = {
  changeLanguage: (code: string) => any;
  translate: (txt: string) => string;
  showToast?: ToastType;
  dispatch?: DispatchProp;
  selector?: any;
  navigation?: NavigationProp<any>;
  resetNavigation: (navigation: NavigationProp<any> | undefined, screen: string, params?: any) => void
  replaceScreen: (navigation: NavigationProp<any> | undefined, screen: string, params?: any) => void
};

export const utility: Utility = {
  translate: function (_txt: string): string {
    throw new Error('Function not implemented.');
  },
  changeLanguage: function (_code: string) {
    throw new Error('Function not implemented.');
  },
  resetNavigation: (navigation, screen, params = {}) => {
    navigation?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: screen,
            params,
          },
        ],
      })
    );
  },
  replaceScreen: (navigation, screen, params = {}) => {
    navigation?.dispatch(StackActions.replace(screen, params));
  }
};
