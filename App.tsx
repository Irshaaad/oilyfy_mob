import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { I18nManager, LogBox, Platform, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { ToastProvider } from 'react-native-toast-notifications';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { LanguageWrapper } from './src/components/common/LanguageWrapper';
import ReqsProvider from './src/components/common/ReqsProvider';
import { ThemeProviders } from './src/Contexts/ThemeProviders';
import RootNavigation from './src/navigation';
import { persistor, store } from './src/redux/store';
import { useNotifications } from './src/utils/hooks/useNotifications';
import { COLORS } from './src/utils/theme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

const App: React.FC = () => {
  LogBox.ignoreAllLogs();
  useNotifications();

  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemNavigationBar.setNavigationColor('#FFFFFF');
    }
    I18nManager.allowRTL(true);
  }, []);

  return (
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <StatusBar backgroundColor={COLORS.white} barStyle={'dark-content'} />
            <LanguageWrapper>
              <ToastProvider placement="top" duration={3000} style={{ top: 30 }} animationType='zoom-in' swipeEnabled>
                <ThemeProviders>
                  <NavigationContainer>
                    <ReqsProvider>
                      <SafeAreaProvider>
                        <RootNavigation />
                      </SafeAreaProvider>
                    </ReqsProvider>
                  </NavigationContainer>
                </ThemeProviders>
              </ToastProvider>
            </LanguageWrapper>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </Provider>
    </PersistGate>
  );
};

export default App;
