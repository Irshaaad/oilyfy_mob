import React, { useContext } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { heightToDP } from 'react-native-responsive-screens';
import { AppThemeContext } from '../../Contexts/ThemeProviders';
import { AppThemeType } from '../../utils/interface';
import { COLORS } from '../../utils/theme';
import { TextSmall } from '../common/Texts';

interface PagePaginationInterface {
    containerStyle: ViewStyle
}

const PagePagination: React.FC<PagePaginationInterface> = (props) => {
    const { containerStyle } = props;
    const { theme } = useContext(AppThemeContext)
    const styles = dynamicStyles(theme)
    return (
        <View style={[styles.container, containerStyle]}>
            {[0, 0, 0, 0].map((item, index) => (
                <View style={styles.numberbox}>
                    <TextSmall color={COLORS.white}>
                        {index + 1}
                    </TextSmall>
                </View>
            ))}
        </View>
    );
};

export default PagePagination;

const dynamicStyles = (theme: AppThemeType) => StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: heightToDP(4),
        width: "100%",
        gap: 5
    },
    numberbox: {
        height: heightToDP(3),
        aspectRatio: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 100,
        backgroundColor: COLORS.blue
    }
});