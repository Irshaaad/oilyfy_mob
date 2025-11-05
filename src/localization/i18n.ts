// i18n.ts
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './en/en';
import ur from './ur/ur';
import ar from './ar/ar';

const resources = {
  en: {translation: en},
  ur: {translation: ur},
  ar: {translation: ar},
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', // initial language
  fallbackLng: 'en',
  defaultNS: 'translation', // NOT "en"
  ns: ['translation'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false, // good default for RN
  },
});

export default i18n;
