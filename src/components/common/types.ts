import { TouchableOpacityProps, ViewStyle } from "react-native";

export interface IconProps extends TouchableOpacityProps {
    onPress?: () => void;
    name: string | any;
    type:
    | 'ionicons'
    | 'material-icons'
    | 'font-awesome'
    | 'font-awesome-5'
    | 'font-awesome-5-pro'
    | 'font-awesome-6'
    | 'simple-line-icon'
    | 'zocial'
    | 'octicon'
    | 'material-community'
    | 'evilicon'
    | 'entypo'
    | 'feather'
    | 'antdesign'
    | 'fontisto'
    | 'foundation';
    color?: string;
    size?: number;
    solid?: boolean | undefined;
    containerStyle?: ViewStyle;
}