import { getSessions, saveSessions } from './storageService';

export const fetchIpAndLog = (sessionId) => {
    // Fetch IP asynchronously with error handling and fallback
    fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(5000) // 5 second timeout
    })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            // Update this specific session with IP
            const current = getSessions();
            const updated = current.map(s => s.id === sessionId ? { ...s, ip: data.ip } : s);
            saveSessions(updated);
        })
        .catch((error) => {
            // Graceful degradation - IP is telemetry only, not critical
            console.warn('IP fetch failed (non-critical):', error.message);
            // Update session with null IP to indicate fetch was attempted
            const current = getSessions();
            const updated = current.map(s => s.id === sessionId ? { ...s, ip: null } : s);
            saveSessions(updated);
        });
};

export const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    // Simple device detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    return isMobile ? 'Mobile' : 'Desktop';
};
