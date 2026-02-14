import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSessionTimer } from '../hooks/useSessionTimer';
import { analytics } from '../services/analytics';
import { sessionStorage } from '../services/sessionStorage';
import CustomToast from '../components/CustomToast';

export default function SessionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [toast, setToast] = useState({ visible: false, type: 'info' as 'success' | 'error' | 'info', title: '', message: '' });

    const email = params.email as string;
    const loginTimestamp = Number(params.loginTimestamp);

    const { formattedDuration, elapsedSeconds } = useSessionTimer(loginTimestamp);

    const showToast = useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
        setToast({ visible: true, type, title, message });
    }, []);

    // Derived values using useMemo
    const startTimeString = useMemo(() => {
        return new Date(loginTimestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    }, [loginTimestamp]);

    const startDateString = useMemo(() => {
        return new Date(loginTimestamp).toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    }, [loginTimestamp]);

    const statusLabel = useMemo(() => {
        if (elapsedSeconds < 60) return 'Just started';
        if (elapsedSeconds < 300) return 'Active';
        if (elapsedSeconds < 1800) return 'In progress';
        return 'Long session';
    }, [elapsedSeconds]);

    const handleLogout = useCallback(() => {
        Alert.alert(
            'End Session',
            `You've been logged in for ${formattedDuration}. Are you sure you want to end your session?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End Session',
                    style: 'destructive',
                    onPress: async () => {
                        analytics.log('LOGOUT', { email, duration: formattedDuration });
                        await sessionStorage.clear();
                        showToast('success', 'Session Ended', 'You have been logged out successfully.');
                        setTimeout(() => {
                            router.replace('/login' as any);
                        }, 1500);
                    },
                },
            ]
        );
    }, [email, formattedDuration, showToast, router]);

    return (
        <SafeAreaProvider style={styles.container}>
            <CustomToast
                visible={toast.visible}
                type={toast.type}
                title={toast.title}
                message={toast.message}
                onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
            />
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                            {email.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.welcomeText}>Welcome back</Text>
                    <Text style={styles.emailText}>{email}</Text>
                    <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>{statusLabel}</Text>
                    </View>
                </View>

                {/* Timer Card */}
                <View style={styles.timerCard}>
                    <Text style={styles.timerLabel}>SESSION DURATION</Text>
                    <Text style={styles.timerValue}>{formattedDuration}</Text>
                </View>

                {/* Info Cards */}
                <View style={styles.infoRow}>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoIcon}>📅</Text>
                        <Text style={styles.infoLabel}>Date</Text>
                        <Text style={styles.infoValue}>{startDateString}</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoIcon}>🕐</Text>
                        <Text style={styles.infoLabel}>Started At</Text>
                        <Text style={styles.infoValue}>{startTimeString}</Text>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.85}
                >
                    <Text style={styles.logoutText}>End Session</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 48,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    welcomeText: {
        fontSize: 14,
        color: '#9CA3AF',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: 4,
    },
    emailText: {
        fontSize: 18,
        color: '#111827',
        fontWeight: '600',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 8,
    },
    statusText: {
        fontSize: 13,
        color: '#065F46',
        fontWeight: '600',
    },
    timerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 32,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    timerLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '600',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    timerValue: {
        fontSize: 56,
        fontWeight: '200',
        color: '#6366F1',
        fontVariant: ['tabular-nums'],
        letterSpacing: 2,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 40,
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    infoIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '600',
    },
    logoutButton: {
        width: '100%',
        backgroundColor: '#FEE2E2',
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutText: {
        color: '#DC2626',
        fontSize: 16,
        fontWeight: '600',
    },
});
