import i18n from '../../localization/i18n';
import { utility } from '../utility';

export const preReqs = (...args: any[]) => {
  let [toast, translation, dispatcher, navigator] = args;
  utility.showToast = toast();
  utility.translate = (text: string = '') => {
    return translation().t(text);
  };
  utility.changeLanguage = (code: string) => i18n.changeLanguage(code);
  utility.dispatch = dispatcher();
  utility.navigation = navigator()
};
