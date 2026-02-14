import React, { useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    NativeSyntheticEvent,
    TextInputKeyPressEventData,
} from 'react-native';

interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
}

/**
 * A row of individual OTP digit boxes.
 * Typing a digit auto-advances to the next box.
 * Backspace on an empty box moves back to the previous one.
 */
export default function OtpInput({ length = 6, value, onChange }: OtpInputProps) {
    const inputsRef = useRef<(TextInput | null)[]>([]);
    const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

    const handleChange = useCallback(
        (text: string, index: number) => {
            // Only allow single digit
            const digit = text.replace(/[^0-9]/g, '').slice(-1);
            const newDigits = [...digits];
            newDigits[index] = digit;

            const newValue = newDigits.join('');
            onChange(newValue);

            // Auto-advance to next box
            if (digit && index < length - 1) {
                inputsRef.current[index + 1]?.focus();
            }
        },
        [digits, length, onChange],
    );

    const handleKeyPress = useCallback(
        (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
            if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
                // Move back on backspace if current box is empty
                inputsRef.current[index - 1]?.focus();
                const newDigits = [...digits];
                newDigits[index - 1] = '';
                onChange(newDigits.join(''));
            }
        },
        [digits, onChange],
    );

    return (
        <View style={styles.container}>
            {digits.map((digit, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => {
                        inputsRef.current[index] = ref;
                    }}
                    style={[styles.box, digit ? styles.boxFilled : null]}
                    value={digit}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                    autoFocus={index === 0}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginVertical: 24,
    },
    box: {
        width: 48,
        height: 56,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        fontSize: 24,
        fontWeight: '600',
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
    },
    boxFilled: {
        borderColor: '#6366F1',
        backgroundColor: '#EEF2FF',
    },
});
