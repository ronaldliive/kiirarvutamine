import { STORAGE_KEY, SETTINGS_KEY, DEFAULT_SETTINGS } from '../utils/constants';
import { Session, Settings, Streak, LeaderboardEntry } from '../types';

const STREAK_KEY = 'kiirarvutamine_streak';
const LEADERBOARD_KEY = 'kiirarvutamine_leaderboard';

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
        const cutoff = new Date('2026-01-18T16:37:00Z').getTime();
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

// --- Gamification ---

export const getStreak = (): Streak => {
    try {
        const saved = localStorage.getItem(STREAK_KEY);
        return saved ? JSON.parse(saved) : { currentStreak: 0, maxStreak: 0, lastPlayedDate: null };
    } catch {
        return { currentStreak: 0, maxStreak: 0, lastPlayedDate: null };
    }
};

export const saveStreak = (streak: Streak): void => {
    try {
        localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
    } catch (e) {
        console.error("Streak save failed", e);
    }
};

export const getLeaderboard = (difficulty: string): LeaderboardEntry[] => {
    try {
        const allBoard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '{}');
        return allBoard[difficulty] || [];
    } catch {
        return [];
    }
};

export const saveLeaderboardEntry = (difficulty: string, entry: LeaderboardEntry): void => {
    try {
        const allBoard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '{}');
        const currentList: LeaderboardEntry[] = allBoard[difficulty] || [];

        // Add new entry
        const newList = [...currentList, entry];

        // Sort: primarily by TIME (asc), secondarily by MISTAKES (asc)
        newList.sort((a, b) => {
            if (a.time !== b.time) return a.time - b.time;
            return a.mistakes - b.mistakes;
        });

        // Keep top 5
        allBoard[difficulty] = newList.slice(0, 5);
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(allBoard));
    } catch (e) {
        console.error("Leaderboard save failed", e);
    }
};
