import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { otpManager } from '../src/services/otpManager';
import { sessionStorage } from '../src/services/sessionStorage';

export default function OtpScreen() {
    const [otp, setOtp] = useState('');
    const router = useRouter();
    const params = useLocalSearchParams();
    const email = params.email as string;

    const handleVerify = async () => {
        if (otp.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter a 6-digit code.');
            return;
        }

        const result = otpManager.validateOtp(email, otp);

        if (result.success) {
            const loginTimestamp = Date.now();
            // Persist session so we can auto-login on app restart
            await sessionStorage.save({ email, loginTimestamp });
            router.replace({
                pathname: '/session',
                params: {
                    email,
                    loginTimestamp: loginTimestamp.toString()
                }
            });
        } else {
            Alert.alert('Verification Failed', result.error);
        }
    };

    const handleResend = () => {
        const newOtp = otpManager.generateOtp(email);
        setOtp('');
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
