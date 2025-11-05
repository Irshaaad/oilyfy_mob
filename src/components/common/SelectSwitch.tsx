import { StyleProp, StyleSheet, Switch, SwitchChangeEvent, Text, View } from 'react-native';
import React, { useContext } from 'react';
import { TextNormal } from '../common/Texts';
import { AppThemeContext } from '../../Contexts/ThemeProviders';
import { AppThemeType } from '../../utils/interface';
import { ViewStyle } from 'react-native';
import { heightToDP } from 'react-native-responsive-screens';
import { COLORS } from '../../utils/theme';

interface SelectSwitchInterface {
    containerStyle?: StyleProp<ViewStyle>;
    label?: string;
    error?: string | undefined;
    value: any;
    onChange: (arg: any) => void;
}

const SelectSwitch: React.FC<SelectSwitchInterface> = (props) => {
    const { label, value, onChange, error, containerStyle } = props;
    const { theme } = useContext(AppThemeContext)
    const styles = dynamicStyles(theme)
    return (
        <View style={[styles.container, containerStyle]}>
            <TextNormal>{label}</TextNormal>
            <Switch
                value={value}
                onChange={(va: SwitchChangeEvent) => onChange(va.nativeEvent.value)}
                thumbColor={COLORS.blue}

                trackColor={{ false: "red", true: COLORS.lightBlue }}
            />
        </View>
    );
};

export default SelectSwitch;

const dynamicStyles = (theme: AppThemeType) => StyleSheet.create({
    container: {
        height: heightToDP(6),
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: COLORS.borderGrey
    }
});