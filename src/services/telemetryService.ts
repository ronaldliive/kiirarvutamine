import { getSessions, saveSessions } from './storageService';
import { Session } from '../types';

export const fetchIpAndLog = (sessionId: string): void => {
    // Fetch IP asynchronously with error handling and fallback
    fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(5000) // 5 second timeout
    })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then((data: { ip: string }) => {
            // Update this specific session with IP
            const current = getSessions();
            const updated = current.map((s: Session) => s.id === sessionId ? { ...s, ip: data.ip } : s);
            saveSessions(updated);
        })
        .catch((error: Error) => {
            // Graceful degradation - IP is telemetry only, not critical
            console.warn('IP fetch failed (non-critical):', error.message);
            // Update session with null IP to indicate fetch was attempted
            const current = getSessions();
            const updated = current.map((s: Session) => s.id === sessionId ? { ...s, ip: null } : s);
            saveSessions(updated);
        });
};

export const getDeviceType = (): string => {
    const userAgent = navigator.userAgent;
    // Simple device detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    return isMobile ? 'Mobile' : 'Desktop';
};
