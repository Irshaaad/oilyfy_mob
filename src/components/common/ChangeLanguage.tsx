import React, {useState} from 'react';
import {
  I18nManager,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {heightToDP, widthToDP} from 'react-native-responsive-screens';
import {ms} from 'react-native-size-matters';
import {useDispatch} from 'react-redux';
import {setLanguage} from '../../redux/reducers/generalSlice';
import {useAppSelector} from '../../redux/store';
import {handleErrorMessage} from '../../utils/helpers';
import {COLORS} from '../../utils/theme';
import CustomButton from './CustomButton';
import CustomIcon from './CustomIcon';
import ModalWrapper from './ModalWrapper';
import {TextNormal} from './Texts';

interface ChangeLanguageProps {
  hideButton: boolean;
  isVisible?: boolean;
  setVisible?: (val: boolean) => void;
}

interface LanguageItemProps {
  iconUrl: string;
  name: string;
  langCode: string;
  selectedLang: string;
  isRTL: boolean;
  hideButton: boolean;
  styles: any;
  onPress: () => void;
}

const ListItem: React.FC<LanguageItemProps> = props => {
  const {styles, isRTL} = props;
  return (
    <TouchableOpacity style={styles.listItem} onPress={props.onPress}>
      <View
        style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          gap: 10,
          alignItems: 'center',
        }}>
        <Image
          source={{uri: props?.iconUrl}}
          height={20}
          width={20}
          style={{borderRadius: 100, overflow: 'hidden'}}
        />
        <TextNormal color={COLORS.blackGrey}>{props?.name}</TextNormal>
      </View>
      {props?.selectedLang === props?.langCode && (
        <CustomIcon
          name={'check'}
          type="material-icons"
          color={COLORS.primary}
          size={20}
        />
      )}
    </TouchableOpacity>
  );
};

export const ChangeLanguage: React.FC<ChangeLanguageProps> = props => {
  const {hideButton = false, isVisible, setVisible} = props;
  const dispatch = useDispatch();

  const [modal, setModal] = useState(false);
  const selectedLanguage = useAppSelector(store => store.generalSlice.language);
  const [lang, setLang] = useState(selectedLanguage);

  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const styles = dynamicStyles(!!isRTL);

  const handleSelectLanguage = (code: any) => {
    setLang(code);
  };

  const openLanguageModal = () => {
    if (hideButton) {
      return setVisible(true);
    }
    setModal(true);
  };
  const closeModal = () => {
    if (hideButton) {
      return setVisible(false);
    }
    setModal(false);
  };

  const onPressSave = async () => {
    try {
      dispatch(setLanguage(lang));
      closeModal();
    } catch (error) {
      handleErrorMessage(error);
    }
  };

  const LIST_ITEMS: LanguageItemProps[] = [
    {
      name: 'English',
      iconUrl: 'https://flagcdn.com/w320/us.png',
      onPress: () => handleSelectLanguage('en'),
      langCode: 'en',
      styles,
      isRTL: !!isRTL,
      selectedLang: selectedLanguage,
    },
    {
      name: 'Urdu',
      iconUrl: 'https://flagcdn.com/w320/pk.png',
      onPress: () => handleSelectLanguage('ur'),
      langCode: 'ur',
      styles,
      isRTL: !!isRTL,
      selectedLang: selectedLanguage,
    },
    {
      name: 'Arabic',
      iconUrl: 'https://flagcdn.com/w320/sa.png',
      onPress: () => handleSelectLanguage('ar'),
      langCode: 'ar',
      styles,
      isRTL: !!isRTL,
      selectedLang: selectedLanguage,
    },
  ];

  return (
    <>
      {!hideButton && (
        <View style={styles.container}>
          <TouchableOpacity onPress={openLanguageModal}>
            <Image
              source={{
                uri: LIST_ITEMS.find(i => i.langCode === selectedLanguage)
                  ?.iconUrl,
              }}
              style={styles.flag}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      )}

      {(isVisible || modal) && (
        <ModalWrapper
          isVisible={isVisible || modal}
          closeModal={closeModal}
          key={'modal-language'}
          modalStyles={{
            justifyContent: 'flex-start',
            // alignItems:"center",
            paddingTop: heightToDP(7),
          }}>
          <View style={styles.languageOptionsContainer}>
            {LIST_ITEMS.map(item => (
              <ListItem {...item} key={item.name} selectedLang={lang} />
            ))}
            <CustomButton gradient title="SAVE" onPress={onPressSave} />
          </View>
        </ModalWrapper>
      )}
    </>
  );
};

const dynamicStyles = (isRTL: boolean) =>
  StyleSheet.create({
    container: {},
    flag: {
      borderRadius: 100,
      width: widthToDP(7),
      aspectRatio: 1,
    },
    languageOptionsContainer: {
      // height: heightToDP(20),
      width: widthToDP(80),
    },

    listContainer: {
      marginTop: 10,
      padding: ms(5),
      borderRadius: 12,
      backgroundColor: '#F9F9F9',
      width: '100%',
      gap: 5,
    },
    listItem: {
      height: heightToDP(6),
      justifyContent: 'space-between',
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: '#E9E9E9',
      paddingHorizontal: widthToDP(2),
    },
  });
