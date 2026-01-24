import { useState } from 'react';
import { getSessions, saveSessions } from '../services/storageService';
import { fetchIpAndLog, getDeviceType } from '../services/telemetryService';

export const useGameSession = () => {
    const [sessions, setSessions] = useState(() => getSessions());
    const [currentSessionId, setCurrentSessionId] = useState(null);

    const startNewSession = (difficulty) => {
        const newSessionId = crypto.randomUUID();
        const deviceType = getDeviceType();

        // Initial object
        const newSession = {
            id: newSessionId,
            date: new Date().toISOString(),
            difficulty: difficulty,
            totalTime: 0,
            questions: [],
            completed: false,
            device: deviceType,
            ip: null // Will be updated by fetch
        };

        // Save immediately
        const currentSessions = getSessions();
        const newSessionsList = [newSession, ...currentSessions];
        saveSessions(newSessionsList);
        setSessions(newSessionsList);
        setCurrentSessionId(newSessionId);

        // Fetch IP asynchronously
        fetchIpAndLog(newSessionId);

        return newSessionId;
    };

    const updateSession = (sessId, currentHistory, timeStr, isCompleted) => {
        const all = getSessions();
        const updated = all.map(s => {
            if (s.id === sessId) {
                return {
                    ...s,
                    totalTime: timeStr,
                    questions: currentHistory,
                    completed: isCompleted,
                    lastUpdated: new Date().toISOString()
                };
            }
            return s;
        });
        saveSessions(updated);
        setSessions(updated); // Sync UI
    };

    const refreshSessions = () => {
        setSessions(getSessions());
    };

    return {
        sessions,
        currentSessionId,
        setCurrentSessionId,
        startNewSession,
        updateSession,
        refreshSessions,
        setSessions
    };
};
