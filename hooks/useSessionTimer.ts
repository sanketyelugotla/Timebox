import { useState, useEffect, useRef } from 'react';

// Formats elapsed seconds into a readable duration:
//  - Under 1 hour:  MM:SS   (e.g. 04:32)
//  - 1–24 hours:    HH:MM   (e.g. 02:15)
//  - 24+ hours:     Xd HH:MM (e.g. 2d 05:30)
const formatTime = (totalSeconds: number): string => {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
        return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const useSessionTimer = (startTime: number) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Function to update elapsed time based on current timestamp
        // This ensures accuracy even if the app goes to background
        const updateTimer = () => {
            const now = Date.now();
            const diff = Math.floor((now - startTime) / 1000);
            setElapsedSeconds(diff >= 0 ? diff : 0);
        };

        // Update immediately
        updateTimer();

        // Set interval to update every second
        intervalRef.current = setInterval(updateTimer, 1000);

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [startTime]);

    return {
        elapsedSeconds,
        formattedDuration: formatTime(elapsedSeconds),
    };
};
