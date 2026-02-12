import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/auth';
import { otpManager } from '../services/otpManager';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Otp'>;
type ScreenRouteProp = RouteProp<AuthStackParamList, 'Otp'>;

export default function OtpScreen() {
    const [otp, setOtp] = useState('');
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { email } = route.params;

    // Basic validation check
    const handleVerify = () => {
        if (otp.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter a 6-digit code.');
            return;
        }

        const result = otpManager.validateOtp(email, otp);

        if (result.success) {
            // Navigate to Session Screen with current timestamp
            navigation.replace('Session', {
                email,
                loginTimestamp: Date.now()
            });
        } else {
            Alert.alert('Verification Failed', result.error);
        }
    };

    const handleResend = () => {
        const newOtp = otpManager.generateOtp(email);
        setOtp(''); // Clear input
        Alert.alert('OTP Resent', `Your new OTP is: ${newOtp}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Enter OTP</Text>
                    <Text style={styles.subtitle}>
                        A 6-digit code was sent to {email}
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="000000"
                        placeholderTextColor="#ccc"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otp}
                        onChangeText={setOtp}
                        textAlign="center"
                        autoFocus
                    />

                    <TouchableOpacity style={styles.button} onPress={handleVerify}>
                        <Text style={styles.buttonText}>Verify</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
                        <Text style={styles.resendText}>Resend OTP</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
        textAlign: 'center',
    },
    input: {
        width: '80%',
        height: 60,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        fontSize: 32,
        marginBottom: 24,
        color: '#333',
        backgroundColor: '#f9f9f9',
        letterSpacing: 8,
    },
    button: {
        backgroundColor: '#007AFF',
        width: '100%',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resendButton: {
        padding: 12,
    },
    resendText: {
        color: '#007AFF',
        fontSize: 16,
    },
});
