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
        return d > twoWeeksAgo && s.completed;
    });

    if (recentSessions.length < 3) return null; // Need some data

    const stats: Record<string, { total: number; wrong: number }> = {
        '+': { total: 0, wrong: 0 },
        '-': { total: 0, wrong: 0 },
        '*': { total: 0, wrong: 0 },
        '/': { total: 0, wrong: 0 }
    };

    recentSessions.forEach(session => {
        session.questions.forEach(q => {
            const op = q.operator;
            const mistakes = (q.attempts?.length || 0);

            if (stats[op]) {
                stats[op].total += 1;
                if (mistakes > 0) stats[op].wrong += 1;
            }
        });
    });

    // Check for high error rates (> 20%)
    let worstOp = '';
    let maxErrorRate = 0;

    Object.entries(stats).forEach(([op, data]) => {
        if (data.total > 10) { // Min sample size
            const rate = data.wrong / data.total;
            if (rate > 0.2 && rate > maxErrorRate) {
                maxErrorRate = rate;
                worstOp = op;
            }
        }
    });

    if (worstOp) {
        const opName = worstOp === '*' ? 'korrutamine' : worstOp === '/' ? 'jagamine' : worstOp === '+' ? 'liitmine' : 'lahutamine';
        return {
            id: `trainer-${worstOp}`,
            title: 'Tark Treener soovitab',
            description: `Märkasin, et ${opName} teeb sulle veidi raskusi.`,
            reason: `Eksimuste osakaal: ${(maxErrorRate * 100).toFixed(0)}%`,
            config: {
                max: 30, // Default meaningful range
                ops: [worstOp]
            }
        };
    }

    // Secondary check: Speed? 
    // Maybe checking if average time is high?
    // Start simple.

    return null;
};
