import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {I18nManager, StyleSheet, View} from 'react-native';
import {useAppSelector} from '../../redux/store';

interface LanguageWrapperProps {
  children: React.ReactNode;
}

export const LanguageWrapper: React.FC<LanguageWrapperProps> = ({children}) => {
  const language = useAppSelector(store => store.generalSlice.language);
  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const {i18n} = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(language).then(() => {
      if (typeof isRTL === 'boolean' && isRTL !== isRTL) {
        I18nManager.allowRTL(!!isRTL);
        I18nManager.forceRTL(!!isRTL);
      }
    });
  }, [language, i18n]);

  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {flex: 1},
});
