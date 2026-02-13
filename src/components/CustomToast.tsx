import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

interface CustomToastProps {
    visible: boolean;
    type: ToastType;
    title: string;
    message: string;
    onDismiss: () => void;
    /** Auto-dismiss after this many ms. Set 0 to disable. Default: 3000 */
    duration?: number;
}

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
    success: { bg: '#F0FDF4', border: '#86EFAC', icon: '✓', text: '#166534' },
    error: { bg: '#FEF2F2', border: '#FCA5A5', icon: '✕', text: '#991B1B' },
    info: { bg: '#EFF6FF', border: '#93C5FD', icon: 'ℹ', text: '#1E40AF' },
};

/**
 * A sleek animated toast/alert that slides in from the top.
 * Far more polished than Alert.alert().
 */
export default function CustomToast({
    visible,
    type,
    title,
    message,
    onDismiss,
    duration = 3000,
}: CustomToastProps) {
    const translateY = useRef(new Animated.Value(-120)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 80,
                    friction: 12,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            if (duration > 0) {
                const timer = setTimeout(() => {
                    dismiss();
                }, duration);
                return () => clearTimeout(timer);
            }
        }
    }, [visible]);

    const dismiss = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -120,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => onDismiss());
    };

    if (!visible) return null;

    const colors = COLORS[type];

    return (
        <Animated.View
            style={[
                styles.container,
                { backgroundColor: colors.bg, borderColor: colors.border, transform: [{ translateY }], opacity },
            ]}
        >
            <TouchableOpacity style={styles.inner} onPress={dismiss} activeOpacity={0.8}>
                <View style={[styles.iconCircle, { backgroundColor: colors.border }]}>
                    <Text style={[styles.icon, { color: colors.text }]}>{colors.icon}</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
                        {message}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        borderRadius: 16,
        borderWidth: 1,
        zIndex: 9999,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    message: {
        fontSize: 13,
        opacity: 0.85,
        lineHeight: 18,
    },
});
