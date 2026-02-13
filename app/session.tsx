import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSessionTimer } from '../src/hooks/useSessionTimer';
import { analytics } from '../src/services/analytics';

export default function SessionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const email = params.email as string;
    const loginTimestamp = Number(params.loginTimestamp);

    const { formattedDuration } = useSessionTimer(loginTimestamp);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    analytics.log('LOGOUT', { email, duration: formattedDuration });
                    router.replace('/'); // Navigate back to index (Login)
                }
            }
        ]);
    };

    const startTimeString = new Date(loginTimestamp).toLocaleTimeString();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.welcomeText}>Welcome, {email}</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Session Started:</Text>
                        <Text style={styles.value}>{startTimeString}</Text>
                    </View>

                    <View style={styles.timerContainer}>
                        <Text style={styles.timerLabel}>Current Session Duration</Text>
                        <Text style={styles.timerValue}>{formattedDuration}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 40,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 24,
        fontWeight: '500',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 16,
    },
    label: {
        fontSize: 16,
        color: '#666',
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    timerContainer: {
        alignItems: 'center',
    },
    timerLabel: {
        fontSize: 14,
        textTransform: 'uppercase',
        color: '#888',
        letterSpacing: 1,
        marginBottom: 8,
    },
    timerValue: {
        fontSize: 48,
        fontWeight: '300',
        color: '#007AFF',
        fontVariant: ['tabular-nums'],
    },
    logoutButton: {
        width: '100%',
        backgroundColor: '#FF3B30',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
