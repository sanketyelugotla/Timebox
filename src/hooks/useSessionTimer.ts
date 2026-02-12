import { useState, useEffect, useRef } from 'react';

// Formats seconds into MM:SS
const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const useSessionTimer = (startTime: number) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
