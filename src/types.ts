export interface Attempt {
    value: string;
    time: number;
    delta: number;
}

export interface Question {
    num1: number;
    num2: number;
    operator: string;
    answer: number;
    str: string;
    // Runtime properties
    attempts?: Attempt[];
    time?: number;
    isOvertime?: boolean;
}

export interface Session {
    id: string;
    date: string;
    difficulty: number | string;
    totalTime: number | string;
    questions: Question[];
    completed: boolean;
    device: string;
    ip: string | null;
    lastUpdated?: string;
    questionCount?: number;
}

export interface Settings {
    questionCount: number;
    timeMinutes: number;
    darkMode: boolean; // Added
}

export interface CustomConfig {
    max: number;
    ops: string[];
}

export interface LeaderboardEntry {
    name: string;
    date: string;
    time: number; // Total seconds
    mistakes: number;
}

export interface Streak {
    currentStreak: number;
    maxStreak: number;
    lastPlayedDate: string | null; // YYYY-MM-DD
}
