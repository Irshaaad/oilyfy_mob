import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const OPTIONS = [
    { key: 'litre', label: 'Litre' },
    { key: 'gallon', label: 'Gallon' },
];

interface RadioUnitSelector {
    value: "litre" | "gallon",
    onChange: (val: "litre" | "gallon") => void,
    style?: ViewStyle,
    labelStyle: TextStyle
    control: Control
}

export default function RadioUnitSelector({ control, style, labelStyle }: RadioUnitSelector) {

    return (
        <Controller
            name='oil_unit'
            defaultValue={"gallon"}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
                <View style={[styles.container, style]} accessibilityRole="radiogroup">
                    {OPTIONS.map((opt) => {
                        const isSelected = value === opt.key;
                        return (
                            <TouchableOpacity
                                key={opt.key}
                                style={styles.option}
                                onPress={() => onChange(opt.key)}
                                accessible={true}
                                accessibilityRole="radio"
                                accessibilityState={{ selected: isSelected }}
                                accessibilityLabel={opt.label}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons
                                    name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
                                    size={22}
                                    style={styles.icon}
                                />
                                <Text style={[styles.label, labelStyle]}>{opt.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        borderRadius: 8,
    },
    icon: {
        marginRight: 6,
    },
    label: {
        fontSize: 16,
    },
});
