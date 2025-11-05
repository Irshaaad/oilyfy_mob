import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { heightToDP, widthToDP } from 'react-native-responsive-screens';
import { ms } from 'react-native-size-matters';
import { AppThemeType } from '../../utils/interface';
import { COLORS } from '../../utils/theme';
import CustomButton from './CustomButton';
import CustomIcon from './CustomIcon';
import { TextNormal, TextSmall } from './Texts';

export type FAQType = {
    id: string;
    heading: string;
    value?: string
    showLearnMore?: boolean;
    children?: React.ReactNode;
    headingStyle?: ViewStyle;
}

const AccordionItem: React.FC<any> = (props) => {
    const {
        isExpanded,
        children,
        viewKey,
        style,
        duration = 500,
    } = props
    const styles = dynamicStyles('dark')

    const height = useSharedValue(0);

    const derivedHeight = useDerivedValue(() =>
        withTiming(height.value * Number(isExpanded.value), {
            duration,
        })
    );
    const bodyStyle = useAnimatedStyle(() => ({
        height: derivedHeight.value,
    }));

    return (
        <Animated.View
            key={`accordionItem_${viewKey}`}
            style={[styles.animatedView, bodyStyle, style]}>
            <View
                onLayout={(e) => {
                    height.value = e.nativeEvent.layout.height;
                }}
                style={styles.wrapper}>
                {children}
            </View>
        </Animated.View>
    );
}

const CustomAccordion: React.FC<FAQType> = (props) => {

    const { heading, id, value, showLearnMore, children, headingStyle } = props

    const open = useSharedValue(false);
    const [isOpen, setIsOpen] = useState(false)
    const onPress = () => {
        open.value = !open.value;
        setIsOpen(!open.value)
    };
    const styles = dynamicStyles('dark')

    return (
        <View style={styles.container} key={id}>
            <TouchableOpacity style={[styles.parent, headingStyle]} onPress={onPress} activeOpacity={0.5}>
                <TextNormal>{heading}</TextNormal>
                <CustomIcon
                    type={"material-community"}
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    color={COLORS['dark'].lightgrey}
                    size={ms(18)}
                />
            </TouchableOpacity>
            <AccordionItem isExpanded={open} viewKey="Accordion" style={{}}>
                {children ? children :
                    <View style={styles.box}>
                        <TextSmall textStyle={{ lineHeight: heightToDP(2) }}>{value}</TextSmall>
                        {showLearnMore && <CustomButton
                            title='LEARN_MORE'
                            textSmall
                            containerStyle={{
                                height: heightToDP(4),
                                width: widthToDP(12),
                                paddingHorizontal: 0,
                                backgroundColor: COLORS['dark'].blue
                            }}
                        />}
                    </View>}
            </AccordionItem>
        </View>
    );
}

export default CustomAccordion

const dynamicStyles = (theme: AppThemeType) => StyleSheet.create({
    container: {
    },
    buttonContainer: {
        flex: 1,
        paddingBottom: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    parent: {
        // width: 200,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.white,
        borderColor: COLORS.borderGrey,
        borderWidth: 1,
        paddingHorizontal: widthToDP(1),
        height: heightToDP(6),
        borderRadius: 5,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
    },
    wrapper: {
        width: '100%',
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
    },
    animatedView: {
        width: '100%',
        overflow: 'hidden',
    },
    box: {
        width: "100%",
        backgroundColor: COLORS.white,
        paddingVertical: ms(8),
        paddingHorizontal: widthToDP(1),
        borderWidth: 1,
        borderColor: COLORS.borderGrey,
        borderTopWidth: 0,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
        gap: 10
    },
});