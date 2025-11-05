import { Image, StyleSheet, Text, View } from 'react-native';
import React, { useContext } from 'react';
import { TextNormal } from '../common/Texts';
import { AppThemeContext } from '../../Contexts/ThemeProviders';
import { AppThemeType } from '../../utils/interface';

interface ListEmptyComponentInterface {
    emptyText?: string;
    image?: { uri: string } | number;
    Svg?: any
}

const ListEmptyComponent: React.FC<ListEmptyComponentInterface> = (props) => {
    const { emptyText, image, Svg } = props;
    const { theme } = useContext(AppThemeContext)
    const styles = dynamicStyles(theme)
    return (
        <View style={styles.container}>
            {
                Svg ? <Svg height={100} width={100} />
                    : image ? <Image source={image} height={100} width={100} />
                        : null
            }
            <TextNormal center>{emptyText || "NO_RECORD_FOUND"}</TextNormal>
        </View>
    );
};

export default ListEmptyComponent;

const dynamicStyles = (theme: AppThemeType) => StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        gap: 10
    }
});