# React Native Passwordless Auth Assignment

This is a React Native application implementing a passwordless authentication flow (Email + OTP) and a session timer, built with **Expo**, **TypeScript**, and **React Native MMKV**.

## 🚀 Setup & Run

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Run the App**

   ```bash
   npx expo start
   ```

   - Scan the QR code with Expo Go (Android/iOS).
   - Or press `w` to run on Web (though MMKV might need a polyfill on web, mobile is preferred).

## 📱 Features

1. **Email Login**:
   - Enters email -> Generates 6-digit OTP locally.
   - **Note:** The OTP is shown in an **Alert** and **Console Log** for testing.

2. **OTP Verification**:
   - **Expiry**: OTP fits 60 seconds validity window.
   - **Lockout**: 3 failed attempts blocks the email.
   - **Resend**: Invalidates old OTP, resets attempts.

3. **Session Timer**:
   - Shows live duration (MM:SS).
   - **Background Safe**: Timer is calculated based on `loginTimestamp` vs `Date.now()`, ensuring accuracy even if the app changes state.
   - **Persisted**: Timer does not reset on re-renders.

## 🛠️ Tech Stack & Architecture

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Storage/Analytics**: `react-native-mmkv`
- **Navigation**: React Navigation

### Architecture Decisions

- **Services (`/services/`)**:
  - `otpManager.ts`: Pure TypeScript logic for OTP generation and validation. zero UI dependencies.
  - `analytics.ts`: Wrapper around MMKV to log events.
- **Hooks (`/hooks/`)**:
  - `useSessionTimer.ts`: Custom hook managing the interval and date math.
- **Screens**:
  - Implemented as route components directly under the `app/` directory.

## 📦 External SDK Choice: React Native MMKV

I chose **React Native MMKV** for the "External SDK" requirement.
**Why?**

1. **Performance**: It is the fastest key-value storage for React Native.
2. **Zero Config**: Unlike Firebase or Sentry, it runs immediately after installation without needing API keys or `google-services.json`. This ensures you can review the code instantly.
3. **Persistence**: usage of `MMKV` ensures logs and state can be persisted synchronously.

## 🤖 AI Usage Declaration

**GPT Assistance:**

- Helped generate standard boilerplate for navigation and routing (`NavigationContainer`).
- Reviewed and validated the `setInterval` cleanup logic used in the custom hooks (`useEffect`).
- Assisted in designing and implementing the `OtpInput` component and the `CustomToast` alert UI.

**My Implementation:**

- Designed the architecture (Service layer separation).
- Implemented the specific business logic for OTP (Map-based storage, expiry checks).
- Created the custom hook for timer accuracy (timestamp diff vs interval increment).
