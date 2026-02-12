export interface OtpData {
  code: string;
  attempts: number;
  expiresAt: number; // Timestamp
}

export interface SessionData {
  email: string;
  loginTimestamp: number;
}

export type AuthStackParamList = {
  Login: undefined;
  Otp: { email: string };
  Session: { email: string; loginTimestamp: number };
};

export type AnalyticsEvent = 
  | 'OTP_GENERATED'
  | 'OTP_VALIDATION_SUCCESS'
  | 'OTP_VALIDATION_FAILURE'
  | 'LOGOUT';
