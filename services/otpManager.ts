import { OtpData } from '../types/auth';
import { analytics } from './analytics';

const OTP_VALIDITY_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 3;

// In-memory storage for OTPs (simulating backend DB)
// Key: email, Value: OtpData
const otpStore = new Map<string, OtpData>();

export const otpManager = {
    // Generates a new 6-digit OTP for the given email.
    // Invalidates any previous OTP.
    generateOtp: (email: string): string => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const otpData: OtpData = {
            code,
            attempts: 0,
            expiresAt: Date.now() + OTP_VALIDITY_MS,
        };

        otpStore.set(email, otpData);

        // Log event
        analytics.log('OTP_GENERATED', { email, code }); // Logging code for debug visibility

        return code;
    },

    // Validates the OTP for the given email.
    // Returns matching result or error message.
    validateOtp: (email: string, inputCode: string): { success: boolean; error?: string } => {
        const data = otpStore.get(email);

        if (!data) {
            analytics.log('OTP_VALIDATION_FAILURE', { email, reason: 'No OTP found' });
            return { success: false, error: 'No OTP requested for this email.' };
        }

        // Check Expiry
        if (Date.now() > data.expiresAt) {
            analytics.log('OTP_VALIDATION_FAILURE', { email, reason: 'Expired' });
            return { success: false, error: 'OTP has expired. Please request a new one.' };
        }

        // Check Max Attempts
        if (data.attempts >= MAX_ATTEMPTS) {
            analytics.log('OTP_VALIDATION_FAILURE', { email, reason: 'Max attempts' });
            return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
        }

        // Check Code Match
        if (data.code !== inputCode) {
            // Increment attempts
            data.attempts += 1;
            otpStore.set(email, data); // Update store

            const remaining = MAX_ATTEMPTS - data.attempts;
            analytics.log('OTP_VALIDATION_FAILURE', { email, reason: 'Incorrect code', attempts: data.attempts });

            if (remaining === 0) {
                return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
            }

            return { success: false, error: `Incorrect OTP. ${remaining} attempts remaining.` };
        }

        // We cleanup the OTP so it can't be reused, 
        otpStore.delete(email);

        analytics.log('OTP_VALIDATION_SUCCESS', { email });
        return { success: true };
    },

    // Helper to check if an email is currently blocked (optional UI helper)
    isBlocked: (email: string): boolean => {
        const data = otpStore.get(email);
        return !!(data && data.attempts >= MAX_ATTEMPTS);
    }
};
