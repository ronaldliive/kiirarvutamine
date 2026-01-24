import { describe, it, expect } from 'vitest';
import { numberToWords, formatTimeSeconds, formatDate } from './formatters';

describe('formatters', () => {
    describe('numberToWords', () => {
        it('formats single digits', () => {
            expect(numberToWords(5)).toBe('viis');
            expect(numberToWords(0)).toBe('null');
        });

        it('formats teens', () => {
            expect(numberToWords(11)).toBe('üksteist');
            expect(numberToWords(15)).toBe('viisteist');
        });

        it('formats tens', () => {
            expect(numberToWords(20)).toBe('kakskümmend');
            expect(numberToWords(23)).toBe('kakskümmend kolm');
            expect(numberToWords(99)).toBe('üheksakümmend üheksa');
        });
    });

    describe('formatTimeSeconds', () => {
        it('formats simple times', () => {
            expect(formatTimeSeconds(65)).toBe('1:05');
            expect(formatTimeSeconds(120)).toBe('2:00');
        });

        it('pads zero seconds', () => {
            expect(formatTimeSeconds(61)).toBe('1:01');
        });
    });
});
