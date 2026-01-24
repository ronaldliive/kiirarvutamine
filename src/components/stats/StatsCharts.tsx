import React, { useMemo, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { Session } from '../../types';
import { formatDate } from '../../utils/formatters';

interface StatsChartsProps {
    sessions: Session[];
}

const StatsCharts: React.FC<StatsChartsProps> = ({ sessions }) => {
    const [difficulty, setDifficulty] = useState<string>('20');

    const data = useMemo(() => {
        // 1. Filter by difficulty
        const filtered = sessions
            .filter(s => s.difficulty.toString() === difficulty)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // 2. Group by Date (Day)
        const grouped: Record<string, {
            date: string;
            totalTime: number;
            totalQuestions: number;
            totalMistakes: number;
            sessionsCount: number;
        }> = {};

        filtered.forEach(session => {
            const dateKey = session.date.split('T')[0]; // YYYY-MM-DD
            if (!grouped[dateKey]) {
                grouped[dateKey] = {
                    date: dateKey,
                    totalTime: 0,
                    totalQuestions: 0,
                    totalMistakes: 0,
                    sessionsCount: 0
                };
            }

            // Calculate mistakes from questions
            const mistakes = session.questions.reduce((acc, q) => {
                const attempts = q.attempts?.length || 0;
                return acc + attempts;
            }, 0);

            const sTime = typeof session.totalTime === 'number' ? session.totalTime : 0;

            grouped[dateKey].totalTime += sTime;
            grouped[dateKey].totalQuestions += session.questions.length;
            grouped[dateKey].totalMistakes += mistakes;
            grouped[dateKey].sessionsCount += 1;
        });

        // 3. Transform to Array
        return Object.values(grouped).map(g => ({
            date: formatDate(g.date).split(' ')[0], // DD.MM
            fullDate: g.date,
            avgSpeed: parseFloat((g.totalTime / g.totalQuestions).toFixed(2)), // Seconds per Question
            errorRate: parseFloat(((g.totalMistakes / g.totalQuestions) * 100).toFixed(1)), // %
            volume: g.totalQuestions
        }));
    }, [sessions, difficulty]);

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500 space-y-4">
                <p>Pole piisavalt andmeid graafikute jaoks.</p>
                <div className="flex gap-2 justify-center">
                    {['10', '20', '30'].map(d => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`px-4 py-2 rounded-xl font-bold transition-all ${difficulty === d
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-amber-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            {d} piires
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Filter */}
            <div className="flex justify-center gap-2 mb-6">
                {['10', '20', '30'].map(d => (
                    <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`px-4 py-2 rounded-xl font-bold transition-all ${difficulty === d
                            ? 'bg-amber-500 text-white shadow-md'
                            : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-amber-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        {d} piires
                    </button>
                ))}
            </div>

            {/* Speed Chart */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-4 pl-2 border-l-4 border-indigo-500">
                    Kiirus (sekundit tehte kohta)
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                tick={{ fontSize: 10 }}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fontSize: 12 }}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="avgSpeed"
                                stroke="#6366f1"
                                strokeWidth={3}
                                dot={{ fill: '#6366f1', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                                name="Sek/Tehe"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-center text-xs text-slate-400 mt-2">Mida madalam, seda parem ⚡</p>
            </div>

            {/* Mistakes Chart */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-4 pl-2 border-l-4 border-red-400">
                    Vigade % (täpsus)
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                tick={{ fontSize: 10 }}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="errorRate"
                                stroke="#f87171"
                                strokeWidth={3}
                                dot={{ fill: '#f87171', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                                name="Vigu %"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-center text-xs text-slate-400 mt-2">Madalam = täpsem 🎯</p>
            </div>

            {/* Volume Chart */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-4 pl-2 border-l-4 border-emerald-400">
                    Lahendatud tehteid
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                tick={{ fontSize: 10 }}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar
                                dataKey="volume"
                                fill="#34d399"
                                radius={[4, 4, 0, 0]}
                                name="Tehteid"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-center text-xs text-slate-400 mt-2">Harjutamine teeb meistriks 💪</p>
            </div>
        </div>
    );
};

export default StatsCharts;
