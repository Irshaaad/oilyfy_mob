import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {heightToDP, widthToDP} from 'react-native-responsive-screens';
import {ms} from 'react-native-size-matters';
import CustomButton from '../../components/common/CustomButton';
import CustomIcon from '../../components/common/CustomIcon';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import {TextNormal, TextSmall} from '../../components/common/Texts';
import {IconProps} from '../../components/common/types';
import {useAppDispatch, useAppSelector} from '../../redux/store';
import {ScreenProps} from '../../utils/interface';
import {COLORS} from '../../utils/theme';
import {utility} from '../../utils/utility';
import {ChangeLanguage} from '../../components/common/ChangeLanguage';
import UploadImageModal from '../../components/UploadImage';
import {handleErrorMessage} from '../../utils/helpers';
import ImageCropPicker from 'react-native-image-crop-picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {API_URL, BASE_URL} from '../../utils/constants';
import {setUserProfilePicture} from '../../redux/reducers/userSlice';
import {useUpdateProfileMutation} from '../../redux/apis/auth';
import {IMAGES} from '../../assets';
import Modal from 'react-native-modal';

interface AccountProps extends ScreenProps {}

interface ListItemProps {
  icon: IconProps;
  name: string;
  styles: any;
  isRTL: boolean;
  onPress: () => void;
}

const ListItem: React.FC<ListItemProps> = React.memo(props => {
  return (
    <TouchableOpacity style={props?.styles.listItem} onPress={props.onPress}>
      <View
        style={{
          flexDirection: props.isRTL ? 'row-reverse' : 'row',
          gap: 5,
          alignItems: 'center',
        }}>
        <CustomIcon
          name={props?.icon?.name || 'home'}
          type={props?.icon?.type || 'ionicons'}
          color={COLORS.blackGrey}
          size={17}
        />
        <TextNormal color={COLORS.blackGrey}>{props?.name}</TextNormal>
      </View>
      <CustomIcon
        name={props.isRTL ? 'chevron-left' : 'chevron-right'}
        type="material-icons"
        color={COLORS.primary}
        size={20}
      />
    </TouchableOpacity>
  );
});

export const Account: React.FC<AccountProps> = props => {
  const {} = props;

  const dispatch = useAppDispatch();

  const [updateProfile, {isLoading: isUpdateProfileLoading}] =
    useUpdateProfileMutation();
  console.log(
    '======[isUpdateProfileLoading]=====',
    JSON.stringify(isUpdateProfileLoading, null, 1),
  );

  const user = useAppSelector(store => store.userSlice);
  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const accessToken = useAppSelector(store => store.generalSlice.accessToken);
  const styles = dynamicStyle(!!isRTL);

  console.log(
    '===user.profile===>',
    JSON.stringify(user.profile_pic_url, null, 1),
  );

  const [changeLang, setChangeLang] = useState(false);
  const [imageModal, setImageModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [photo, setPhoto] = useState({url: user.profile_pic_url});

  const LIST_ITEMS: ListItemProps[] = [
    {
      name: 'PROFILE_INFORMATION',
      icon: {
        name: 'account-outline',
        type: 'material-community',
      },
      onPress: () => {
        utility.navigation?.navigate('ProfileInformation');
      },
      isRTL: !!isRTL,
      styles,
    },
    // {
    //   name: 'CHANGE_PASSWORD',
    //   icon: {
    //     name: 'lock',
    //     type: 'octicon',
    //   },
    //   onPress: () => {
    //     utility.navigation?.navigate('ForgotPassword');
    //   },
    //   isRTL: !!isRTL,
    //   styles,
    // },
    {
      name: 'CHANGE_LANGUAGE',
      icon: {
        name: 'language-outline',
        type: 'ionicons',
      },
      onPress: () => {
        setChangeLang(true);
      },
      isRTL: !!isRTL,
      styles,
    },
    // {
    //   name: 'HELP',
    //   icon: {
    //     name: 'question',
    //     type: 'octicon',
    //   },
    //   onPress: () => {},
    //   isRTL: !!isRTL,
    //   styles,
    // },
    // {
    //   name: 'TERMS_N_CONDITIONS',
    //   icon: {
    //     name: 'text-box-outline',
    //     type: 'material-community',
    //   },
    //   onPress: () => {},
    //   isRTL: !!isRTL,
    //   styles,
    // },
  ];

  const onLogout = () => {
    // utility.replaceScreen(utility.navigation, 'Login');
    utility.resetNavigation(utility.navigation, 'Login');
    dispatch({type: 'LOGOUT', payload: null});
  };

  const closeImageModal = () => setImageModal(false);

  const onCamera = async () => {
    try {
      const res = await ImageCropPicker.openCamera({
        multiple: false,
        compressImageQuality: 0.5,
        forceJpg: true,
        includeBase64: true,
        mediaType: 'photo',
        maxFiles: 5,
      });
      closeImageModal();
      if (res.length) {
        const images = res.map(img => ({
          type: img.mime,
          base64: img.data,
          url: Platform.select({ios: img.sourceURL, android: img.path}),
          name: img.filename,
        }));
        await handleImageUpload(images);
      } else {
        const image = {
          type: res.mime,
          base64: res.data,
          url: Platform.select({ios: res.sourceURL, android: res.path}),
          name: res.filename,
        };
        await handleImageUpload([image]);
      }
    } catch (error) {
      closeImageModal();
      handleErrorMessage(error);
    } finally {
      closeImageModal();
    }
  };

  const onAlbum = async () => {
    try {
      const res = await ImageCropPicker.openPicker({
        multiple: false,
        compressImageQuality: 0.5,
        forceJpg: true,
        includeBase64: true,
        mediaType: 'photo',
        maxFiles: 5,
      });
      closeImageModal();
      if (res.length) {
        const images = res.map(img => ({
          type: img.mime,
          base64: img.data,
          url: Platform.select({ios: img.sourceURL, android: img.path}),
          name: img.filename,
        }));

        await handleImageUpload(images);
      } else {
        const image = {
          type: res.mime,
          base64: res.data,
          url: Platform.select({ios: res.sourceURL, android: res.path}),
          name: res.filename,
        };

        await handleImageUpload([image]);
      }
    } catch (error) {
      handleErrorMessage(error);
      closeImageModal();
    } finally {
      closeImageModal();
    }
  };

  const handleImageUpload = async (images: any[]) => {
    const result = [];
    // console.log('===images===>', JSON.stringify(images, null, 1));
    try {
      setUploadLoading(true);
      for (const element of images) {
        const base64Data = element.base64.replace(
          /^data:image\/\w+;base64,/,
          '',
        );
        const fileName = element.name;
        const call = await ReactNativeBlobUtil.fetch(
          'POST',
          `${API_URL}uploads?upload_type=1&route_type=1`,
          {
            Authorization: `${accessToken}`, // Don't set Content-Type manually
          },
          [
            {
              name: 'images', // This should match your server field name
              filename: fileName,
              type: 'image/png',
              data: base64Data, // this must be raw base64 data without prefix
            },
          ],
        );
        const response = JSON.parse(call.data);
        console.log('===response===>', JSON.stringify(response, null, 1));
        const url = `${BASE_URL}${response?.result[0]?.path}`;
        setPhoto({url});
        console.log('===url===>', JSON.stringify(url, null, 1));

        if (!response?.success) {
          throw new Error('Error uploading images');
        }

        const res = await updateProfile({
          profile_pic_url: url,
          id: user.id,
        }).unwrap();
        console.log('===res===>', JSON.stringify(res, null, 1));

        dispatch(setUserProfilePicture(url));

        result.push({url});
      }
      setUploadLoading(false);
      return result;
    } catch (error) {
      handleErrorMessage(error);
      setUploadLoading(false);
    } finally {
      setUploadLoading(false);
    }
  };

  const removePhoto = async () => {
    try {
      await updateProfile({id: user.id, profile_pic_url: ''}).unwrap();
      dispatch(setUserProfilePicture(''));
      setPhoto('');
    } catch (error) {}
  };

  return (
    <SafeAreaWrapper>
      <View
        style={{
          gap: 10,
          //   height: '10%',
          alignItems: 'center',
          flexDirection: isRTL ? 'row-reverse' : 'row',
        }}>
        <TouchableOpacity
          onPress={utility.navigation?.goBack}
          style={{left: 10}}>
          <CustomIcon
            name={isRTL ? 'arrow-right' : 'arrow-left'}
            type="material-community"
            size={ms(22)}
          />
        </TouchableOpacity>
        {/* <TextNormal bold>ACCOUNT</TextNormal> */}
      </View>
      <View style={styles.container}>
        <View
          style={styles.accountImageContainer}
          onPress={() => setImageModal(true)}>
          {user.profile_pic_url ? (
            <Image
              resizeMode="cover"
              key={'profile-photo'}
              resizeMethod="resize"
              style={styles.image}
              
              source={{uri: `${user.profile_pic_url}`}}
            />
          ) : (
            <Image
              resizeMode="cover"
              resizeMethod="resize"
              key={'demo-photo'}
              style={styles.image}
              source={IMAGES.demo}
            />
          )}
          <TouchableOpacity
            style={styles.editContainer}
            onPress={
              user?.profile_pic_url ? removePhoto : () => setImageModal(true)
            }>
            <View
              style={{
                height: 30,
                aspectRatio: 1,
                borderRadius: 100,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                backgroundColor: COLORS.primary,
              }}>
              {uploadLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <CustomIcon
                  name={user?.profile_pic_url ? 'delete' : 'add'}
                  type="material-icons"
                  color={user?.profile_pic_url ? 'white' : 'white'}
                  size={18}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.textContainer}>
          <TextNormal center bold>
            {user?.name}
          </TextNormal>
          <TextSmall center color={COLORS.blackGrey}>
            {user?.email_address}
          </TextSmall>
        </View>

        <View style={styles.listContainer}>
          {LIST_ITEMS.map(item => (
            <ListItem {...item} key={item.name} />
          ))}
        </View>

        <View style={styles.logoutContainer}>
          <CustomButton
            tirtiary
            title="LOGOUT"
            containerStyle={{borderColor: COLORS.red}}
            textStyles={{color: COLORS.red}}
            onPress={onLogout}
          />
        </View>
      </View>

      <ChangeLanguage
        hideButton
        isVisible={changeLang}
        setVisible={setChangeLang}
      />

      <UploadImageModal
        visible={imageModal}
        onClose={closeImageModal}
        onCamera={onCamera}
        onAlbum={onAlbum}
      />

      <Modal
        isVisible={isUpdateProfileLoading || uploadLoading}
        style={{margin: 0}}
        animationIn={'slideInUp'}
        animationOut={'fadeOut'}
        backdropOpacity={0.2}
        animationInTiming={500}
        animationOutTiming={500}>
        <View style={styles.loadingModal}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <TextNormal center style={{marginTop: 10}}>
              Loading..
            </TextNormal>
          </View>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
};

const dynamicStyle = (isRTL: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      width: '100%',
      gap: 15,
      paddingHorizontal: widthToDP(5),
    },
    accountImageContainer: {
      borderRadius: 100,
      // overflow: 'hidden',
      borderWidth: 2,
      borderColor: COLORS.primary,
      width: widthToDP(27),
      aspectRatio: 1,
    },
    image: {
      height: '100%',
      width: '100%',
      borderRadius: 100,
      // backgroundColor: 'red',
    },
    textContainer: {
      gap: 5,
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
      height: heightToDP(5),
      justifyContent: 'space-between',
      flexDirection: !isRTL ? 'row' : 'row-reverse',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: '#E9E9E9',
      paddingHorizontal: widthToDP(2),
    },
    logoutContainer: {
      width: '100%',
      position: 'absolute',
      bottom: 20,
    },
    editContainer: {
      position: 'absolute',
      bottom: 5,
      right: 5,
      zIndex: 100,
    },
    loadingModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      minWidth: 120,
      minHeight: 120,
      justifyContent: 'center',
    },
  });
