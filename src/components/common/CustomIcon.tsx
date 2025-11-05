import React, { useContext } from 'react';
import { TouchableOpacity } from 'react-native';
import { scale } from 'react-native-size-matters';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome5Pro from 'react-native-vector-icons/FontAwesome5Pro';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Foundation from 'react-native-vector-icons/Foundation';
import IonIcons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Zocial from 'react-native-vector-icons/Zocial';
import { AppThemeContext } from '../../Contexts/ThemeProviders';
import { COLORS } from '../../utils/theme';
import { IconProps } from './types';

const CustomIcon: React.FC<IconProps> = props => {
  const { theme } = useContext(AppThemeContext)
  const {
    onPress,
    containerStyle,
    size = scale(25),
    color = COLORS.black,
    solid,
    name,
    type = 'ionicons',
    ...rest
  } = props;
  const disabled = typeof onPress !== 'function';


  return (
    <TouchableOpacity
      style={[containerStyle]}
      onPress={onPress}
      disabled={disabled}
      {...rest}>
      {type === 'ionicons' && (
        <IonIcons
          name={name}
          // solid={solid}
          size={size}
          color={color}
          disabled
        />
      )}
      {type === 'material-icons' && (
        <MaterialIcons
          name={name}
          // solid={solid}
          size={size}
          color={color}
          disabled
        />
      )}
      {type === 'font-awesome' && (
        <FontAwesome
          name={name}
          // solid={solid}
          size={size}
          color={color}
          disabled
        />
      )}
      {type === 'font-awesome-5' && (
        <FontAwesome5
          name={name}
          // solid={solid}
          size={size}
          color={color}
          disabled
        />
      )}
      {type === 'simple-line-icon' && (
        <SimpleLineIcons
          name={name}
          // solid={solid}
          size={size}
          color={color}
          disabled
        />
      )}
      {type === 'zocial' && (
        <Zocial name={name} //solid={solid}
          size={size} color={color} disabled />
      )}
      {type === 'octicon' && (
        <Octicons
          name={name}
          // solid={solid}
          size={size}
          color={color}
          disabled
        />
      )}
      {type === 'material-community' && (
        <MaterialCommunityIcons
          name={name}
          // solid={solid}
          size={size}
          color={color}
          disabled
        />
      )}
      {type === 'evilicon' && (
        <EvilIcons
          name={name}
          // solid={solid}
          size={size}
          color={color}
          disabled
        />
      )}
      {type === 'entypo' && (
        <Entypo name={name} //solid={solid} 
          size={size} color={color} disabled />
      )}
      {type === 'feather' && (
        <Feather name={name} //solid={solid} 
          size={size} color={color} disabled />
      )}
      {type === 'antdesign' && (
        <AntDesign
          name={name}
          // solid={solid}
          size={size}
          color={color}
          disabled
        />
      )}
      {type === 'fontisto' && (
        <Fontisto
          name={name}
          // solid={solid}
          size={size}
          color={color}
          disabled
        />
      )}
      {type === 'foundation' && (
        <Foundation
          name={name}
          // solid={solid}
          size={size}
          color={color}
          disabled
        />
      )}
      {type === 'font-awesome-5-pro' && (
        <FontAwesome5Pro
          name={name}
          // solid={solid}
          size={size}
          color={color}
          disabled
        />
      )}
      {type === 'font-awesome-6' && (
        <FontAwesome6 name={name} size={size}
          color={color} disabled
        //  solid = {solid} 
        />
      )}
    </TouchableOpacity>
  );
};

export default CustomIcon;
