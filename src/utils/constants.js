// Storage Keys
export const STORAGE_KEY = 'math_zen_sessions';
export const SETTINGS_KEY = 'math_zen_settings';

// Default Settings
export const DEFAULT_SETTINGS = {
    questionCount: 48,
    timeMinutes: 10
};

// Game Constants
export const BREAK_WRONG_THRESHOLD = 3;           // Show break modal after 3 consecutive wrong answers
export const HELP_OVERTIME_SECONDS = 60;          // Show help buttons after 60s overtime
export const TRIVIAL_QUESTION_PROBABILITY = 0.15; // 15% chance to allow trivial questions
export const QUESTION_GENERATION_MAX_ATTEMPTS = 50;
export const COMMUTATIVE_REPETITION_LOOKBACK = 20; // Check last N questions for commutative repetition
export const CORRECT_FEEDBACK_DELAY_MS = 1500;    // Delay before moving to next question
export const INCORRECT_FEEDBACK_DELAY_MS = 400;   // Delay before clearing incorrect feedback
