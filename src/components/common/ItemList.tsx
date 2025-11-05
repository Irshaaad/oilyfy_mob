import { StyleProp, StyleSheet, Switch, SwitchChangeEvent, Text, View } from 'react-native';
import React, { useContext } from 'react';
import { TextNormal } from './Texts';
import { AppThemeContext } from '../../Contexts/ThemeProviders';
import { AppThemeType } from '../../utils/interface';
import { ViewStyle } from 'react-native';
import { heightToDP } from 'react-native-responsive-screens';
import { COLORS } from '../../utils/theme';

interface ItemListInterface {
    containerStyle?: StyleProp<ViewStyle>;
    list: {
        label?: string;
        value: any;
    }[]
}

const ItemList: React.FC<ItemListInterface> = (props) => {
    const { list, containerStyle } = props;
    const { theme } = useContext(AppThemeContext)
    const styles = dynamicStyles(theme)
    return (
        list.map(({ label, value }, index) => (
            <View style={[styles.container, containerStyle, { borderBottomWidth: index === list.length - 1 ? 0 : 1 }]} key={index.toString()}>
                <TextNormal>{label}</TextNormal>
                <TextNormal color={COLORS.blue}>{value}</TextNormal>
            </View>
        ))
    );
};

export default ItemList;

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