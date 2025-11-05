/* eslint-disable react-native/no-inline-styles */
import React, { useContext } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { scale, vs } from 'react-native-size-matters';
import { LANGUAGES } from '../../utils/constants';
import { COLORS } from '../../utils/theme';
import CustomIcon from './CustomIcon';
import { TextNormal } from './Texts';

import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import { setLanguage } from '../../redux/reducers/generalSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { utility } from '../../utils/utility';
import { ThemeContext } from '../../Contexts/ThemeProviders';
import { AppThemeType } from '../../utils/interface';

interface LanguageSelectorProps { }

const LanguageSelector: React.FC<LanguageSelectorProps> = props => {
  const { } = props;
  const { theme } = useContext(ThemeContext)
  const styles = dynamicStyles(theme)

  const dispatch = useAppDispatch();
  const language = useAppSelector(store => store.generalSlice.language);

  const onSelectLangugage = (lng: string) => {
    utility.changeLanguage(lng);
    dispatch(setLanguage(lng));
  };

  return (
    <View style={styles.container}>
      <Menu>
        <MenuTrigger>
          <MenuPress language={language} theme={theme} />
        </MenuTrigger>
        <MenuOptions
          customStyles={{
            optionsContainer: {
              backgroundColor: '#FBFBFB',
              top: 100,
              position: 'absolute',
              borderRadius: 20,
              overflow: 'hidden',
              borderColor: '#CED7DA',
              borderWidth: 1,
            },
            optionsWrapper: {
              borderColor: '#CED7DA',
              borderRadius: 100,
            },
          }}>
          {LANGUAGES.map((lang, index) => {
            return (
              <MenuOption
                key={lang.langCode}
                onSelect={() => onSelectLangugage(lang.langCode)}
                customStyles={{
                  optionWrapper: {
                    borderColor: '#CED7DA',
                    borderBottomWidth: index === 2 ? 0 : 1,
                  },
                  optionTouchable: { backgroundColor: 'transparent' },
                }}>
                <View style={styles.optionItem}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      flex: 2,
                    }}>
                    <Image source={{ uri: lang.flagUrl }} style={styles.flag} />
                    <TextNormal textBreakStrategy="balanced">
                      {lang.name}
                    </TextNormal>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <CustomIcon
                      name={
                        lang.langCode === language
                          ? 'radio-btn-active'
                          : 'radio-btn-passive'
                      }
                      type="fontisto"
                      color={
                        lang.langCode === language
                          ? COLORS.primary
                          : COLORS.borderGrey
                      }
                    />
                  </View>
                </View>
              </MenuOption>
            );
          })}
        </MenuOptions>
      </Menu>
    </View>
  );
};

const MenuPress: React.FC<{ language: string, theme: AppThemeType }> = ({ language, theme }) => {
  const styles = dynamicStyles(theme)
  return (
    <View style={styles.menu}>
      <Image
        source={{ uri: LANGUAGES.find(i => i.langCode === language)?.flagUrl }}
        style={styles.flag}
      />
      <CustomIcon
        name="keyboard-arrow-down"
        type="material-icons"
        color={'#464C54'}
      />
    </View>
  );
};

export default LanguageSelector;

const dynamicStyles = (theme: AppThemeType) => StyleSheet.create({
  container: {
    height: vs(50),
    alignItems: 'flex-end',
  },
  menu: {
    borderWidth: 1,
    borderColor: COLORS.borderGrey,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    padding: 7,
    backgroundColor: '#FBFBFB',
  },

  flag: {
    borderRadius: 100,
    height: scale(28),
    aspectRatio: 1,
  },

  optionItem: {
    padding: 7,
    backgroundColor: '#FBFBFB',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
