import { Streak, LeaderboardEntry } from '../types';
import { getStreak, saveStreak, getLeaderboard, saveLeaderboardEntry } from './storageService';

/**
 * Updates the user's daily streak.
 * Should be called when a game is completed successfully.
 * 
 * Rules:
 * - If lastPlayed was today: no change.
 * - If lastPlayed was yesterday: streak + 1.
 * - If lastPlayed was before yesterday: reset to 1.
 */
export const updatePlayerStreak = (): Streak => {
    const current = getStreak();
    const today = new Date().toISOString().split('T')[0];
    const last = current.lastPlayedDate;

    if (last === today) return current;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak: Streak;

    if (last === yesterdayStr) {
        const val = current.currentStreak + 1;
        newStreak = {
            currentStreak: val,
            maxStreak: Math.max(current.maxStreak, val),
            lastPlayedDate: today
        };
    } else {
        newStreak = {
            currentStreak: 1,
            maxStreak: Math.max(current.maxStreak, 1),
            lastPlayedDate: today
        };
    }

    saveStreak(newStreak);
    return newStreak;
};

export const checkIsHighScore = (difficulty: string, time: number, mistakes: number): boolean => {
    const board = getLeaderboard(difficulty);
    // If fewer than 5 entries, any complete game is a high score
    if (board.length < 5) return true;

    // Check against the 5th (worst) score
    const worst = board[board.length - 1];

    // Better time?
    if (time < worst.time) return true;

    // Same time but fewer mistakes?
    if (time === worst.time && mistakes < worst.mistakes) return true;

    return false;
};

export const addHighScore = (difficulty: string, name: string, time: number, mistakes: number): void => {
    const entry: LeaderboardEntry = {
        name,
        time,
        mistakes,
        date: new Date().toISOString()
    };
    saveLeaderboardEntry(difficulty, entry);
};
