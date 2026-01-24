import { STORAGE_KEY, SETTINGS_KEY, DEFAULT_SETTINGS } from '../utils/constants';
import { Session, Settings } from '../types';

/**
 * Returns all stored game sessions from localStorage.
 * Filters out sessions older than the cutoff date (2026-01-18).
 * 
 * @returns {Array<Object>} Array of session objects
 */
export const getSessions = (): Session[] => {
    try {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        // Filter out sessions older than 2026-01-18 18:37
        // Use timestamp directly to avoid Safari/iOS Date parsing issues with timezones
        const cutoff = new Date('2026-01-18T16:37:00Z').getTime(); // Use Z time which is universally supported
        return all.filter((s: Session) => {
            const t = new Date(s.date).getTime();
            return !isNaN(t) && t > cutoff;
        });
    } catch {
        return [];
    }
};

export const saveSessions = (sessions: Session[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
        console.error("Save failed", e);
    }
};

export const getSettings = (): Settings => {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
};

export const saveSettings = (newSettings: Settings): void => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
        console.error("Settings save failed", e);
    }
};
