import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionData } from '../types/auth';

const SESSION_KEY = 'active_session';

// Service to persist and retrieve session data using AsyncStorage.
// This enables auto-login when the app restarts.
export const sessionStorage = {
    // Save session data after successful OTP verification.
    save: async (data: SessionData): Promise<void> => {
        try {
            await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    },

    // Load existing session (returns null if no session exists).
    load: async (): Promise<SessionData | null> => {
        try {
            const raw = await AsyncStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error('Failed to load session:', error);
            return null;
        }
    },

    // Clear session on logout.
    clear: async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem(SESSION_KEY);
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    },
};
