/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { heightToDP, widthToDP } from 'react-native-responsive-screens';
import AccountSVG from '../../assets/svgs/account.svg';
import OilfySmallSVG from '../../assets/svgs/oilfy-small.svg';
import { useAppSelector } from '../../redux/store';
import { utility } from '../../utils/utility';
import { ChangeLanguage } from '../common/ChangeLanguage';
import { COLORS } from '../../utils/theme';

interface HomeHeaderProps { }

export const HomeHeader: React.FC<HomeHeaderProps> = props => {
  const { } = props;

  const redirectToAccount = () => utility.navigation?.navigate('Account');
  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const styles = dynamicStyles(!!isRTL);
  const profile_pic_url = useAppSelector(
    store => store.userSlice?.profile_pic_url,
  );

  return (
    <View style={styles.container}>
      <OilfySmallSVG />
      <View
        style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        <ChangeLanguage hideButton={false} />
        <TouchableOpacity onPress={redirectToAccount} style={styles.image}>
          <Image
            resizeMode="cover"
            resizeMethod="resize"
            style={{ height: '100%', width: '100%' }}
            source={{
              uri: profile_pic_url
                ? `${profile_pic_url}`
                : 'https://avatar.iran.liara.run/public/32',
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const dynamicStyles = (isRTL: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      height: heightToDP(7),
      justifyContent: 'space-between',
    },
    image: {
      // height: heightToDP(5),
      aspectRatio: 1,
      width: widthToDP(8),
      borderRadius: 100,
      borderWidth: 1.5,
      borderColor: COLORS.primary,
      overflow: 'hidden',
    },
  });
