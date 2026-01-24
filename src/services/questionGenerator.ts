import { TRIVIAL_QUESTION_PROBABILITY, QUESTION_GENERATION_MAX_ATTEMPTS } from '../utils/constants';
import { Question } from '../types';

// Safe random helper
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

interface GeneratorConfig {
    max: number;
    ops: string[];
}

/**
 * Generates a random math question based on difficulty level and constraints.
 */
export const generateQuestion = (
    limit: number | GeneratorConfig,
    existingOps: string[] = ['+', '-'],
    recentHistory: Question[] = [],
    mode: 'standard' | 'detective' = 'standard'
): Question => {
    let candidate: Question | undefined;
    let attempts = 0;

    // If limit is an object, it's custom config
    const maxVal = typeof limit === 'object' ? limit.max : limit;
    // Robustly handle ops: default to +,- if null
    const methods = (typeof limit === 'object' ? limit.ops : existingOps) || ['+', '-'];

    // Analysis of recent history for filtering
    const lastItem = recentHistory[recentHistory.length - 1];
    const lastAnswer = lastItem ? lastItem.answer : null;
    const recentStrings = new Set(recentHistory.map(h => h.str));

    while (attempts < QUESTION_GENERATION_MAX_ATTEMPTS) {
        const operator = methods[Math.floor(Math.random() * methods.length)];
        let num1: number = 0, num2: number = 0;

        switch (operator) {
            case '+':
                // sum <= maxVal, avoid 0 if possible
                if (maxVal < 2) { num1 = 0; num2 = 0; }
                else {
                    num1 = randomInt(1, maxVal - 1);
                    num2 = randomInt(1, maxVal - num1);
                }
                break;
            case '-':
                // result >= 0
                if (maxVal < 1) { num1 = 0; num2 = 0; }
                else {
                    num1 = randomInt(1, maxVal);
                    num2 = randomInt(1, num1);
                }
                break;
            case '*':
                if (maxVal < 4) {
                    num1 = randomInt(1, maxVal);
                    num2 = 1;
                } else {
                    num1 = randomInt(2, Math.floor(maxVal / 2));
                    // Ensure product fits
                    const maxNum2 = Math.floor(maxVal / num1);
                    if (maxNum2 < 2) { num2 = 1; }
                    else { num2 = randomInt(2, maxNum2); }
                }
                break;
            case '/':
                if (maxVal < 4) {
                    num1 = 1; num2 = 1;
                } else {
                    const answer = randomInt(2, Math.floor(maxVal / 2));
                    const maxDivisor = Math.floor(maxVal / answer);
                    if (maxDivisor < 2) { num2 = 1; }
                    else { num2 = randomInt(2, maxDivisor); }
                    num1 = answer * num2;
                }
                break;
            default:
                num1 = 1; num2 = 1;
        }

        let ans: number;
        switch (operator) {
            case '+': ans = num1 + num2; break;
            case '-': ans = num1 - num2; break;
            case '*': ans = num1 * num2; break;
            case '/': ans = num1 / num2; break;
            default: ans = 0;
        }

        const str = `${num1} ${operator} ${num2}`;

        // Determine hidden part
        let hidden: 'num1' | 'num2' | 'answer' = 'answer';
        if (mode === 'detective') {
            // Randomly hide operand. 
            hidden = Math.random() > 0.5 ? 'num1' : 'num2';
        }

        candidate = {
            num1,
            num2,
            operator,
            answer: ans,
            str,
            hiddenPart: hidden
        };

        // --- LOGIC CHECKS ---

        // 1. Triviality Check
        const isTrivial =
            (operator === '-' && num1 === num2) ||
            (operator === '+' && (num1 === 0 || num2 === 0)) ||
            (operator === '*' && (num1 === 1 || num2 === 1)) ||
            (operator === '/' && num2 === 1);

        if (isTrivial) {
            if (Math.random() > TRIVIAL_QUESTION_PROBABILITY) {
                attempts++; continue;
            }
        }

        // 2. Strict Repetition
        if (recentStrings.has(str)) {
            attempts++; continue;
        }

        // 3. Consecutive Same Answer
        if (lastAnswer !== null && ans === lastAnswer) {
            if (attempts < 20) { attempts++; continue; }
        }

        // 4. Commutative Repetition (2+3 vs 3+2)
        if (operator === '+' || operator === '*') {
            const reversed = `${num2} ${operator} ${num1}`;
            if (recentStrings.has(reversed)) {
                attempts++; continue;
            }
        }

        break;
    }

    if (!candidate) {
        candidate = { num1: 1, num2: 1, operator: '+', answer: 2, str: '1 + 1', hiddenPart: 'answer' };
    }
    return candidate;
};
