import { Session, CustomConfig } from '../types';

export interface Recommendation {
    id: string;
    title: string;
    description: string;
    config: CustomConfig;
    reason: string;
}

// Helper to calc stats for a set of sessions
const getStats = (sessions: Session[]) => {
    let total = 0;
    let wrong = 0;
    let timeSum = 0;
    const ops: Record<string, { total: number; wrong: number }> = {};

    sessions.forEach(s => {
        s.questions.forEach(q => {
            total++;
            timeSum += (q.time || 0);
            if (q.attempts && q.attempts.length > 0) {
                wrong++;
                if (!ops[q.operator]) ops[q.operator] = { total: 0, wrong: 0 };
                ops[q.operator].wrong++;
            }
            if (!ops[q.operator]) ops[q.operator] = { total: 0, wrong: 0 };
            ops[q.operator].total++;
        });
    });

    return { total, wrong, timeSum, ops };
};

export const analyzeWeaknesses = (sessions: Session[]): Recommendation | null => {
    if (sessions.length === 0) return null;

    // Group by difficulty tier
    const tiers: Record<string, Session[]> = {
        '10': [],
        '20': [],
        '30': [],
        'other': []
    };

    sessions.forEach(s => {
        const d = s.difficulty.toString();
        if (tiers[d]) tiers[d].push(s);
        else tiers['other'].push(s);
    });

    // Strategy: Master 10 -> Master 20 -> Master 30

    // 1. Analyze 10 piires
    if (tiers['10'].length >= 3) {
        const stats = getStats(tiers['10']);
        const errorRate = stats.wrong / stats.total;
        const avgSpeed = stats.timeSum / stats.total;

        if (errorRate > 0.15) {
            return {
                id: 'master-10-accuracy',
                title: 'Tark Treener soovitab',
                description: '10 piires arvutamine vajab veel täpsust. Harjutame veel!',
                reason: `Eksimuste määr 10 piires: ${(errorRate * 100).toFixed(0)}%`,
                config: { max: 10, ops: ['+', '-', '*', '/'] }
            };
        }
        if (avgSpeed > 5.0) { // Slow for 10
            return {
                id: 'master-10-speed',
                title: 'Tark Treener soovitab',
                description: '10 piires oled täpne, aga proovime kiiremini!',
                reason: `Keskmine aeg: ${avgSpeed.toFixed(1)}s (siht < 3s)`,
                config: { max: 10, ops: ['+', '-', '*', '/'] }
            };
        }
    } else if (tiers['10'].length > 0 && tiers['10'].length < 3) {
        // Keep playing 10
        return {
            id: 'keep-10',
            title: 'Tark Treener soovitab',
            description: 'Teeme veel mõned mängud 10 piires kindlustunde saamiseks.',
            reason: 'Vähe mänge analüüsiks.',
            config: { max: 10, ops: ['+', '-', '*', '/'] }
        };
    }

    // 2. Analyze 20 piires (if 10 is OK or skipped)
    if (tiers['20'].length > 0) {
        const stats = getStats(tiers['20']);
        const errorRate = stats.wrong / stats.total;
        const avgSpeed = stats.timeSum / stats.total;

        if (errorRate > 0.15) {
            return {
                id: 'master-20-accuracy',
                title: 'Tark Treener soovitab',
                description: '20 piires tuleb vigu sisse. Võtame selle fookusesse.',
                reason: `Eksimuste määr 20 piires: ${(errorRate * 100).toFixed(0)}%`,
                config: { max: 20, ops: ['+', '-', '*', '/'] }
            };
        }
        if (avgSpeed > 6.0) {
            return {
                id: 'master-20-speed',
                title: 'Tark Treener soovitab',
                description: '20 piires saaks veidi nobedamini.',
                reason: `Keskmine aeg: ${avgSpeed.toFixed(1)}s`,
                config: { max: 20, ops: ['+', '-', '*', '/'] }
            };
        }
    }

    // 3. Analyze 30 piires
    if (tiers['30'].length > 0) {
        const stats = getStats(tiers['30']);
        const errorRate = stats.wrong / stats.total;

        if (errorRate > 0.15) {
            return {
                id: 'master-30-accuracy',
                title: 'Tark Treener soovitab',
                description: '30 piires on vaja täpsust parandada.',
                reason: `Eksimuste määr: ${(errorRate * 100).toFixed(0)}%`,
                config: { max: 30, ops: ['+', '-', '*', '/'] }
            };
        }
    }

    // 4. Global Weakness Check (across all tiers)
    // If we are here, general accuracy is likely OK per tier, but maybe one operator is bad everywhere
    const globalStats = getStats(sessions);
    let worstOp = '';
    let maxErrorRate = 0;

    Object.entries(globalStats.ops).forEach(([op, data]) => {
        if (data.total >= 5) {
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
            description: `Üldiselt tubli, aga ${opName} vajab eraldi tähelepanu.`,
            reason: `Eksimuste määr: ${(maxErrorRate * 100).toFixed(0)}%`,
            config: {
                max: 30,
                ops: [worstOp]
            }
        };
    }

    // 5. Grandmaster / Default
    return {
        id: 'trainer-grandmaster',
        title: 'Tark Treener soovitab',
        description: 'Suurepärane vorm! Paneme nüüd hullu.',
        reason: 'Oled tasemed 10-30 läbinud.',
        config: {
            max: 50,
            ops: ['+', '-']
        }
    };
};
