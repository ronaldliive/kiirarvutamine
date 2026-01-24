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
}

export interface CustomConfig {
    max: number;
    ops: string[];
}
