import React, { useState, useEffect } from 'react';
import { BarChart2, XCircle, Calendar, ChevronUp, ChevronDown, Share2, Download, Trophy, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { formatDate, formatTimeSeconds } from '../../utils/formatters';
import { generateClipboardText, copyToClipboard, downloadCSV } from '../../services/exportService';
import { getLeaderboard } from '../../services/storageService';
import { Session, LeaderboardEntry } from '../../types';
import StatsCharts from './StatsCharts';

interface StatsScreenProps {
    sessions: Session[];
    onBack: () => void;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ sessions, onBack }) => {
    const [view, setView] = useState<'history' | 'leaderboard' | 'charts'>('history');
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
    const [leaderboardDiff, setLeaderboardDiff] = useState<string>('20');
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        if (view === 'leaderboard') {
            setLeaderboardData(getLeaderboard(leaderboardDiff));
        }
    }, [view, leaderboardDiff]);

    return (
        <div className="h-[100dvh] w-screen flex flex-col bg-slate-50 dark:bg-slate-900 relative transition-colors duration-300">
            <div className="flex-none bg-white dark:bg-slate-800 p-4 shadow-sm flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-slate-700 dark:text-white flex items-center gap-2">
                    <BarChart2 size={20} className="text-zen-accent" /> Statistika
                </h2>
                <button
                    onClick={onBack}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    <XCircle size={28} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex p-2 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 gap-2">
                <button
                    onClick={() => setView('history')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${view === 'history' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    Ajalugu
                </button>
                <button
                    onClick={() => setView('leaderboard')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${view === 'leaderboard' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    Edetabel
                </button>
                <button
                    onClick={() => setView('charts')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${view === 'charts' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    Graafikud
                </button>
            </div>

            {view === 'history' && (
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {sessions.length === 0 ? (
                        <div className="text-center text-slate-400 mt-10">Ajalugu puudub</div>
                    ) : (
                        sessions.map((session) => (
                            <div key={session.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700">
                                <div
                                    onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                                    className="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 dark:active:bg-slate-700"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-200 font-medium">
                                            <Calendar size={14} />
                                            {formatDate(session.date)}
                                            {!session.completed && (
                                                <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 rounded-full">Pooleli</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            <span>
                                                {session.questions.length} vastatud
                                            </span> • {typeof session.difficulty === 'object' ? 'Eritreening' : session.difficulty} piires • {typeof session.totalTime === 'number' ? formatTimeSeconds(session.totalTime) : session.totalTime}
                                        </div>
                                    </div>
                                    <div className="text-slate-300 dark:text-slate-500">
                                        {expandedSessionId === session.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>

                                {/* Detailed Dropdown */}
                                {expandedSessionId === session.id && (
                                    <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-2 text-sm space-y-2 max-h-80 overflow-y-auto">
                                        <div className="flex gap-2 mb-4 px-2">
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    const text = generateClipboardText(session);
                                                    await copyToClipboard(text);
                                                    alert("Tulemus kopeeritud!");
                                                }}
                                                className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs py-1.5 px-3 rounded-full transition-colors"
                                            >
                                                <Share2 size={12} /> Kopeeri
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadCSV(session);
                                                }}
                                                className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs py-1.5 px-3 rounded-full transition-colors"
                                            >
                                                <Download size={12} /> Lae CSV
                                            </button>
                                        </div>

                                        {session.questions.map((q, i) => (
                                            <div key={i} className="flex flex-col border-b border-slate-100 dark:border-slate-700 last:border-0 pb-1">
                                                <div className="flex justify-between px-2 py-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-400 w-4">{i + 1}.</span>
                                                        <span className="text-slate-600 dark:text-slate-300">{q.str} = {q.answer}</span>
                                                    </div>
                                                    <span className={`font-mono ${q.isOvertime ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                                                        {(q.time || 0).toFixed(1)}s
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {view === 'leaderboard' && (
                <div className="flex-grow flex flex-col p-4 bg-amber-50/30 dark:bg-slate-900">
                    {/* Difficulty Selector */}
                    <div className="flex justify-center gap-2 mb-6">
                        {['10', '20', '30'].map(d => (
                            <button
                                key={d}
                                onClick={() => setLeaderboardDiff(d)}
                                className={`px-4 py-2 rounded-xl font-bold transition-all ${leaderboardDiff === d
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-amber-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {d} piires
                            </button>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-amber-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 bg-amber-100/50 dark:bg-slate-700/50 border-b border-amber-100 dark:border-slate-600 flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold">
                            <Trophy size={20} className="fill-amber-500 text-amber-600" />
                            TOP 5 - {leaderboardDiff} piires
                        </div>

                        <div className="divide-y divide-amber-50/50 dark:divide-slate-700">
                            {leaderboardData.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 italic">
                                    Ei ole veel rekordeid. Mängi ja ole esimene!
                                </div>
                            ) : (
                                leaderboardData.map((entry, idx) => (
                                    <div key={idx} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                                ${idx === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    idx === 1 ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
                                                        idx === 2 ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'text-slate-400'}
                                            `}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700 dark:text-slate-200">{entry.name}</div>
                                                <div className="text-[10px] text-slate-400">{formatDate(entry.date)}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono font-bold text-amber-600 dark:text-amber-500 flex items-center justify-end gap-1">
                                                <Clock size={14} />
                                                {formatTimeSeconds(entry.time)}
                                            </div>
                                            {entry.mistakes > 0 ? (
                                                <div className="text-[10px] text-red-400 flex items-center justify-end gap-1">
                                                    <AlertCircle size={10} />
                                                    {entry.mistakes} viga
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-green-500 dark:text-green-400 font-medium">Veatu!</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {view === 'charts' && (
                <div className="flex-grow overflow-y-auto p-4 bg-emerald-50/30 dark:bg-slate-900">
                    <StatsCharts sessions={sessions} />
                </div>
            )}
        </div>
    );
};

export default StatsScreen;
