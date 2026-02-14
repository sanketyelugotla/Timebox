import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { otpManager } from '../services/otpManager';
import { sessionStorage } from '../services/sessionStorage';
import OtpInput from '../components/OtpInput';
import CustomToast from '../components/CustomToast';

export default function OtpScreen() {
    const [otp, setOtp] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [toast, setToast] = useState({ visible: false, type: 'info' as 'success' | 'error' | 'info', title: '', message: '' });
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const router = useRouter();
    const params = useLocalSearchParams();
    const email = params.email as string;

    // Start OTP countdown timer
    useEffect(() => {
        setCountdown(60);
        countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (countdownRef.current) clearInterval(countdownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, []);

    const showToast = useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
        setToast({ visible: true, type, title, message });
    }, []);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            showToast('error', 'Incomplete Code', 'Please enter all 6 digits.');
            return;
        }

        const result = otpManager.validateOtp(email, otp);

        if (result.success) {
            const loginTimestamp = Date.now();
            await sessionStorage.save({ email, loginTimestamp });
            showToast('success', 'Verified!', 'Redirecting to your session...');
            setTimeout(() => {
                router.replace({
                    pathname: '/session' as any,
                    params: { email, loginTimestamp: loginTimestamp.toString() },
                });
            }, 1200);
        } else {
            showToast('error', 'Verification Failed', result.error || 'Invalid OTP');
            setOtp('');
        }
    };

    const handleResend = () => {
        const newOtp = otpManager.generateOtp(email);
        setOtp('');
        setCountdown(60);

        // Restart countdown
        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (countdownRef.current) clearInterval(countdownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        showToast('success', 'New Code Sent', `Your new OTP is: ${newOtp}`);
    };

    const formatCountdown = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
                            <Text style={styles.iconEmoji}>🔐</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>Verify Your Email</Text>
                    <Text style={styles.subtitle}>
                        Enter the 6-digit code sent to{'\n'}
                        <Text style={styles.emailHighlight}>{email}</Text>
                    </Text>

                    {/* OTP Input Boxes */}
                    <OtpInput value={otp} onChange={setOtp} length={6} />

                    {/* Countdown */}
                    <View style={styles.countdownContainer}>
                        {countdown > 0 ? (
                            <Text style={styles.countdownText}>
                                Code expires in <Text style={styles.countdownBold}>{formatCountdown(countdown)}</Text>
                            </Text>
                        ) : (
                            <Text style={styles.countdownExpired}>Code has expired</Text>
                        )}
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity
                        style={[styles.button, otp.length < 6 && styles.buttonDisabled]}
                        onPress={handleVerify}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.buttonText}>Verify Code</Text>
                    </TouchableOpacity>

                    {/* Resend */}
                    <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
                        <Text style={styles.resendText}>
                            Didn&apos;t receive the code? <Text style={styles.resendLink}>Resend</Text>
                        </Text>
                    </TouchableOpacity>
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
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
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
        fontSize: 26,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
    },
    emailHighlight: {
        color: '#6366F1',
        fontWeight: '600',
    },
    countdownContainer: {
        marginBottom: 28,
    },
    countdownText: {
        fontSize: 14,
        color: '#6B7280',
    },
    countdownBold: {
        fontWeight: '700',
        color: '#6366F1',
    },
    countdownExpired: {
        fontSize: 14,
        color: '#EF4444',
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#6366F1',
        width: '100%',
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 16,
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
    resendButton: {
        padding: 12,
    },
    resendText: {
        fontSize: 14,
        color: '#6B7280',
    },
    resendLink: {
        color: '#6366F1',
        fontWeight: '600',
    },
});
