import { MMKV } from 'react-native-mmkv';
import { AnalyticsEvent } from '../types/auth';

export const storage = new MMKV();

class AnalyticsService {
    private static STORAGE_KEY = 'analytics_logs';

    /**
     * Logs an event to MMKV storage and Console.
     * @param event The event name
     * @param details Optional metadata
     */
    log(event: AnalyticsEvent, details?: Record<string, any>) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            event,
            timestamp,
            details,
        };

        // 1. Log to Console (for immediate developer feedback)
        console.log(`[Analytics] ${event}`, details || '');

        // 2. Persist to MMKV (simulate external SDK)
        const existingLogsStr = storage.getString(AnalyticsService.STORAGE_KEY);
        const logs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
        logs.push(logEntry);
        storage.set(AnalyticsService.STORAGE_KEY, JSON.stringify(logs));
    }

    /**
     * Retrieve all logs (for debugging purposes)
     */
    getLogs() {
        const logs = storage.getString(AnalyticsService.STORAGE_KEY);
        return logs ? JSON.parse(logs) : [];
    }

    /**
     * Clear logs
     */
    clearLogs() {
        storage.delete(AnalyticsService.STORAGE_KEY);
    }
}

export const analytics = new AnalyticsService();
