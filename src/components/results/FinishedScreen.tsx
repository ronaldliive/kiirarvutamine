import React, { useEffect, useState } from 'react';
import { RotateCcw, Share2, XCircle, Trophy, Flame } from 'lucide-react';
import { formatTimeSeconds } from '../../utils/formatters';
import { generateClipboardText, copyToClipboard } from '../../services/exportService';
import { Question, Settings, Session, Streak } from '../../types';
import { updatePlayerStreak, checkIsHighScore, addHighScore } from '../../services/gamificationService';

interface FinishedScreenProps {
    history: Question[];
    totalElapsedTime: number;
    settings: Settings;
    difficulty: number | string;
    onRestart: () => void;
    onHome: () => void;
    sessions: Session[];
    currentSessionId: string | null;
}

const FinishedScreen: React.FC<FinishedScreenProps> = ({
    history,
    totalElapsedTime,
    settings,
    difficulty,
    onRestart,
    onHome,
    sessions,
    currentSessionId
}) => {
    const [streakInfo, setStreakInfo] = useState<{ updated: boolean, streak: Streak } | null>(null);
    const [isHighScore, setIsHighScore] = useState(false);
    const [highScoreName, setHighScoreName] = useState('');
    const [scoreSaved, setScoreSaved] = useState(false);

    useEffect(() => {
        // Only run if game was completed fully (all questions answered)
        if (history.length >= settings.questionCount) {
            // 1. Update Streak
            const newStreak = updatePlayerStreak();
            setStreakInfo({ updated: true, streak: newStreak });

            // 2. Check High Score
            if (typeof difficulty !== 'object') {
                const diffKey = difficulty.toString();
                const mistakes = history.filter(q => q.attempts && q.attempts.length > 0).length;

                if (checkIsHighScore(diffKey, totalElapsedTime, mistakes)) {
                    setIsHighScore(true);
                }
            }
        }
    }, []);

    const saveScore = () => {
        if (!highScoreName.trim()) return;
        const diffKey = difficulty.toString();
        const mistakes = history.filter(q => q.attempts && q.attempts.length > 0).length;
        addHighScore(diffKey, highScoreName, totalElapsedTime, mistakes);
        setScoreSaved(true);
        setIsHighScore(false);
    };

    return (
        <div className="flex-grow flex flex-col p-4 overflow-hidden relative bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

            {/* Celebration Header */}
            <div className="flex-none text-center mb-4">
                <h2 className="text-3xl font-bold text-green-500 mb-2">
                    {history.length >= settings.questionCount ? 'Tubli!' : 'Hästi tehtud!'}
                </h2>

                {streakInfo && (
                    <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-1.5 rounded-full text-sm font-bold animate-bounce-short">
                        <Flame size={16} className="fill-orange-500" />
                        {streakInfo.streak.currentStreak} päeva järjest!
                    </div>
                )}
            </div>

            {/* High Score Modal / Input Area */}
            {isHighScore && !scoreSaved && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700/50 rounded-2xl p-4 mb-4 animate-in zoom-in duration-300">
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-bold mb-2">
                        <Trophy size={20} className="fill-yellow-500" />
                        Uus rekord!
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">Sisesta oma nimi edetabeli jaoks:</p>
                    <div className="flex gap-2">
                        <input
                            value={highScoreName}
                            onChange={(e) => setHighScoreName(e.target.value)}
                            placeholder="Sinu nimi"
                            className="flex-grow px-3 py-2 rounded-xl border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            autoFocus
                        />
                        <button
                            onClick={saveScore}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl font-bold shadow-sm active:scale-95 transition-transform"
                        >
                            Salvesta
                        </button>
                    </div>
                </div>
            )}

            <div className="flex justify-center gap-6 mb-4 flex-none">
                <div className="text-center">
                    <p className="text-slate-400 dark:text-slate-500 text-xs uppercase">Aeg</p>
                    <p className="text-2xl font-mono text-zen-accent">{formatTimeSeconds(totalElapsedTime)}</p>
                </div>
                <div className="text-center">
                    <p className="text-slate-400 dark:text-slate-500 text-xs uppercase">Tehteid</p>
                    <p className="text-2xl font-mono text-slate-600 dark:text-slate-300">{history.length}/{settings.questionCount}</p>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 space-y-2 mb-4 scrollbar-hide border border-slate-100 dark:border-slate-700">
                {history.map((item, idx) => (
                    <div key={idx} className="flex flex-col border-b border-slate-50 dark:border-slate-700 last:border-0 pb-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-300 dark:text-slate-600 w-5 text-sm text-right">{idx + 1}.</span>
                                <span className="text-lg font-medium text-slate-700 dark:text-slate-200">{item.str} = {item.answer}</span>
                            </div>
                            <span className={`font-mono ${item.isOvertime ? 'text-red-500 font-bold' : 'text-green-600 dark:text-green-400'}`}>
                                {(item.time || 0).toFixed(1)}s
                            </span>
                        </div>
                        {item.attempts && item.attempts.length > 0 && (
                            <div className="ml-9 mt-1 flex flex-col gap-1">
                                {item.attempts.map((att, aidx) => (
                                    <div key={aidx} className="text-xs text-red-400 flex items-center gap-2">
                                        <XCircle size={10} />
                                        <span>Pakkus <b>{att.value}</b></span>
                                        <span className="text-slate-400 dark:text-slate-500">@{att.time.toFixed(1)}s</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex-none gap-3 flex flex-col">
                <button
                    onClick={onRestart}
                    className="bg-zen-accent hover:bg-sky-500 text-white rounded-2xl py-4 text-xl font-semibold shadow-md transition-colors w-full flex items-center justify-center gap-2"
                >
                    <RotateCcw size={24} /> Uuesti
                </button>
                <button
                    onClick={async () => {
                        const sessionToShare = sessions.find(s => s.id === currentSessionId) || {
                            id: 'temp',
                            difficulty,
                            date: new Date().toISOString(),
                            totalTime: totalElapsedTime,
                            questions: history,
                            completed: true,
                            device: 'Unknown',
                            ip: null,
                            questionCount: settings.questionCount
                        };
                        const text = generateClipboardText(sessionToShare);
                        const success = await copyToClipboard(text);
                        if (success) alert("Tulemus kopeeritud!");
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-2xl py-4 text-xl font-semibold shadow-md transition-colors w-full flex items-center justify-center gap-2"
                >
                    <Share2 size={24} /> Jaga sõbraga
                </button>
                <button
                    onClick={onHome}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl py-3 text-lg font-medium shadow-sm transition-colors w-full"
                >
                    Algusesse
                </button>
            </div>
        </div>
    );
};

export default FinishedScreen;
