import React from 'react';
import { RotateCcw, Share2, XCircle } from 'lucide-react';
import { formatTimeSeconds } from '../../utils/formatters';
import { generateClipboardText, copyToClipboard } from '../../services/exportService';

const FinishedScreen = ({
    history,
    totalElapsedTime,
    settings,
    difficulty,
    onRestart,
    onHome,
    sessions,
    currentSessionId
}) => {
    return (
        <div className="flex-grow flex flex-col p-4 overflow-hidden relative">
            <h2 className="text-3xl font-bold text-green-500 text-center mb-2 flex-none">
                {history.length >= settings.questionCount ? 'Tubli!' : 'Hästi tehtud!'}
            </h2>

            <div className="flex justify-center gap-6 mb-4 flex-none">
                <div className="text-center">
                    <p className="text-slate-400 text-xs uppercase">Aeg</p>
                    <p className="text-2xl font-mono text-zen-accent">{formatTimeSeconds(totalElapsedTime)}</p>
                </div>
                <div className="text-center">
                    <p className="text-slate-400 text-xs uppercase">Tehteid</p>
                    <p className="text-2xl font-mono text-slate-600">{history.length}/{settings.questionCount}</p>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto bg-white rounded-2xl shadow-sm p-4 space-y-2 mb-4 scrollbar-hide">
                {history.map((item, idx) => (
                    <div key={idx} className="flex flex-col border-b border-slate-50 last:border-0 pb-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-300 w-5 text-sm text-right">{idx + 1}.</span>
                                <span className="text-lg font-medium text-slate-700">{item.question} = {item.answer}</span>
                            </div>
                            <span className={`font-mono ${item.isOvertime ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                                {item.time.toFixed(1)}s
                            </span>
                        </div>
                        {/* Telemetry Display for Finished Screen */}
                        {item.attempts.length > 0 && (
                            <div className="ml-9 mt-1 flex flex-col gap-1">
                                {item.attempts.map((att, aidx) => (
                                    <div key={aidx} className="text-xs text-red-400 flex items-center gap-2">
                                        <XCircle size={10} />
                                        <span>Pakkus <b>{att.value}</b></span>
                                        <span className="text-slate-400">@{att.time.toFixed(1)}s</span>
                                        {aidx > 0 && (
                                            <span className="text-orange-300 text-[10px]">(vahe {att.delta.toFixed(1)}s)</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex-none gap-3 flex flex-col">
                <button
                    onClick={() => onRestart(difficulty)}
                    className="bg-zen-accent hover:bg-sky-500 text-white rounded-2xl py-4 text-xl font-semibold shadow-md transition-colors w-full flex items-center justify-center gap-2"
                >
                    <RotateCcw size={24} /> Uuesti
                </button>
                <button
                    onClick={async () => {
                        // Find current session object or fallback
                        const sessionToShare = sessions.find(s => s.id === currentSessionId) || {
                            difficulty, date: new Date().toISOString(), totalTime: totalElapsedTime, questions: history, questionCount: settings.questionCount // Ensure count is present
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
                    className="bg-slate-100 text-slate-500 rounded-2xl py-3 text-lg font-medium shadow-sm transition-colors w-full"
                >
                    Algusesse
                </button>
            </div>
        </div>
    );
};

export default FinishedScreen;
