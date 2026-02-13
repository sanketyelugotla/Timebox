import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsEvent } from '../types/auth';

class AnalyticsService {
    private static STORAGE_KEY = 'analytics_logs';

    /**
     * Logs an event to AsyncStorage and Console.
     * @param event The event name
     * @param details Optional metadata
     */
    async log(event: AnalyticsEvent, details?: Record<string, any>) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            event,
            timestamp,
            details,
        };

        // 1. Log to Console
        console.log(`[Analytics] ${event}`, details || '');

        // 2. Persist to AsyncStorage (Async)
        try {
            const existingLogsStr = await AsyncStorage.getItem(AnalyticsService.STORAGE_KEY);
            const logs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
            logs.push(logEntry);
            await AsyncStorage.setItem(AnalyticsService.STORAGE_KEY, JSON.stringify(logs));
        } catch (error) {
            console.error('Failed to save analytics log:', error);
        }
    }

    /**
     * Retrieve all logs
     */
    async getLogs() {
        try {
            const logs = await AsyncStorage.getItem(AnalyticsService.STORAGE_KEY);
            return logs ? JSON.parse(logs) : [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Clear logs
     */
    async clearLogs() {
        await AsyncStorage.removeItem(AnalyticsService.STORAGE_KEY);
    }
}

export const analytics = new AnalyticsService();
