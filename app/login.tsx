import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { otpManager } from '../services/otpManager';
import { sessionStorage } from '../services/sessionStorage';
import CustomToast from '../components/CustomToast';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [toast, setToast] = useState({ visible: false, type: 'info' as 'success' | 'error' | 'info', title: '', message: '' });
    const router = useRouter();

    // Check for existing session on mount (auto-login)
    useEffect(() => {
        const checkSession = async () => {
            const session = await sessionStorage.load();
            if (session) {
                router.replace({
                    pathname: '/session' as any,
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
    }, [router]);

    const showToast = useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
        setToast({ visible: true, type, title, message });
    }, []);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSendOtp = () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            showToast('error', 'Missing Email', 'Please enter your email address.');
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            showToast('error', 'Invalid Email', 'Please enter a valid email address.');
            return;
        }

        if (otpManager.isBlocked(trimmedEmail)) {
            showToast('error', 'Blocked', 'Too many failed attempts. Please try again later.');
            return;
        }

        const otp = otpManager.generateOtp(trimmedEmail);
        showToast('success', 'OTP Sent!', `Your verification code is: ${otp}`);

        // Navigate after a short delay so user can see the toast
        setTimeout(() => {
            router.push({ pathname: '/otp' as any, params: { email: trimmedEmail } });
        }, 1800);
    };

    if (isCheckingSession) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <SafeAreaProvider style={styles.container}>
            <CustomToast
                visible={toast.visible}
                type={toast.type}
                title={toast.title}
                message={toast.message}
                onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.iconEmoji}>✉️</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>
                        Sign in with your email to continue.{'\n'}We&apos;ll send you a one-time verification code.
                    </Text>

                    {/* Email Input */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="you@example.com"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    {/* Send OTP Button */}
                    <TouchableOpacity
                        style={[styles.button, !email.trim() && styles.buttonDisabled]}
                        onPress={handleSendOtp}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.buttonText}>Send Verification Code</Text>
                    </TouchableOpacity>

                    {/* Footer */}
                    <Text style={styles.footerText}>
                        By continuing, you agree to our Terms of Service
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E7FF',
    },
    iconEmoji: {
        fontSize: 36,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 36,
        lineHeight: 22,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    input: {
        height: 52,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    button: {
        backgroundColor: '#6366F1',
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 24,
    },
});
