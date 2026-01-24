import { Session, CustomConfig } from '../types';

export interface Recommendation {
    id: string;
    title: string;
    description: string;
    config: CustomConfig;
    reason: string;
}

export const analyzeWeaknesses = (sessions: Session[]): Recommendation | null => {
    // Only analyze completed sessions from last 2 weeks
    const recentSessions = sessions.filter(s => {
        const d = new Date(s.date);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        return d > twoWeeksAgo;
    });

    if (recentSessions.length === 0) return null;

    const stats: Record<string, { total: number; wrong: number; timeSum: number }> = {
        '+': { total: 0, wrong: 0, timeSum: 0 },
        '-': { total: 0, wrong: 0, timeSum: 0 },
        '*': { total: 0, wrong: 0, timeSum: 0 },
        '/': { total: 0, wrong: 0, timeSum: 0 }
    };

    let totalQs = 0;

    recentSessions.forEach(session => {
        session.questions.forEach(q => {
            const op = q.operator;
            const mistakes = (q.attempts?.length || 0);
            const time = q.time || 0;

            if (stats[op]) {
                stats[op].total += 1;
                stats[op].timeSum += time;
                if (mistakes > 0) stats[op].wrong += 1;
                totalQs++;
            }
        });
    });

    if (totalQs < 5) return null; // Very minimal data check

    // 1. Check for high error rates (> 15%)
    let worstOp = '';
    let maxErrorRate = 0;

    Object.entries(stats).forEach(([op, data]) => {
        if (data.total >= 3) {
            const rate = data.wrong / data.total;
            if (rate > 0.15 && rate > maxErrorRate) {
                maxErrorRate = rate;
                worstOp = op;
            }
        }
    });

    if (worstOp) {
        const opName = worstOp === '*' ? 'korrutamine' : worstOp === '/' ? 'jagamine' : worstOp === '+' ? 'liitmine' : 'lahutamine';
        return {
            id: `trainer-weakness-${worstOp}`,
            title: 'Tark Treener soovitab',
            description: `Harjutame ${opName === 'korrutamine' || opName === 'jagamine' ? 'seda' : ''} ${opName}t, seal tuleb veel vigu sisse.`,
            reason: `Eksimuste määr: ${(maxErrorRate * 100).toFixed(0)}%`,
            config: {
                max: 20,
                ops: [worstOp]
            }
        };
    }

    // 2. If accuracy is good, check mainly Speed
    // Suggest "Sprint"
    return {
        id: 'trainer-speed',
        title: 'Tark Treener soovitab',
        description: 'Oled väga täpne! Nüüd tõstame tempot.',
        reason: 'Lisa koormust kiirustreeninguga.',
        config: {
            max: 50,
            ops: ['+', '-']
        }
    };
};
