import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { otpManager } from '../src/services/otpManager';
import { sessionStorage } from '../src/services/sessionStorage';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const router = useRouter();

    // Check for existing session on mount (auto-login)
    useEffect(() => {
        const checkSession = async () => {
            const session = await sessionStorage.load();
            if (session) {
                router.replace({
                    pathname: '/session',
                    params: {
                        email: session.email,
                        loginTimestamp: session.loginTimestamp.toString(),
                    },
                });
            } else {
                setIsCheckingSession(false);
            }
        };
        checkSession();
    }, []);

    // Show loading while checking for existing session
    if (isCheckingSession) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }
    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSendOtp = () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            Alert.alert('Error', 'Please enter an email address.');
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        if (otpManager.isBlocked(trimmedEmail)) {
            Alert.alert('Access Denied', 'Too many failed attempts. Please try again later.');
            return;
        }

        const otp = otpManager.generateOtp(trimmedEmail);
        // For testing purposes, we show the OTP in an alert
        Alert.alert('OTP Generated', `Your OTP is: ${otp}`, [
            {
                text: 'OK',
                onPress: () => router.push({ pathname: '/otp', params: { email: trimmedEmail } })
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Enter your email to sign in</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        placeholderTextColor="#888"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
                        <Text style={styles.buttonText}>Send OTP</Text>
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
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 24,
        color: '#333',
        backgroundColor: '#f9f9f9',
    },
    button: {
        backgroundColor: '#007AFF',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
});
