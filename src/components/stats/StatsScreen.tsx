import React, { useState } from 'react';
import { BarChart2, XCircle, Calendar, ChevronUp, ChevronDown, Share2, Download } from 'lucide-react';
import { formatDate, formatTimeSeconds } from '../../utils/formatters';
import { generateClipboardText, copyToClipboard, downloadCSV } from '../../services/exportService';
import { Session } from '../../types';

interface StatsScreenProps {
    sessions: Session[];
    onBack: () => void;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ sessions, onBack }) => {
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

    return (
        <div className="flex-grow flex flex-col bg-slate-50 relative h-full">
            <div className="flex-none bg-white p-4 shadow-sm flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                    <BarChart2 size={20} className="text-zen-accent" /> Statistika
                </h2>
                <button
                    onClick={onBack}
                    className="text-slate-400 hover:text-slate-600"
                >
                    <XCircle size={28} />
                </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {sessions.length === 0 ? (
                    <div className="text-center text-slate-400 mt-10">Ajalugu puudub</div>
                ) : (
                    sessions.map((session) => (
                        <div key={session.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                            <div
                                onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                                className="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                                        <Calendar size={14} />
                                        {formatDate(session.date)}
                                        {!session.completed && (
                                            <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 rounded-full">Pooleli</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        <span>
                                            {session.questions.length} vastatud
                                        </span> • {session.difficulty} piires • {typeof session.totalTime === 'number' ? formatTimeSeconds(session.totalTime) : session.totalTime}
                                    </div>
                                </div>
                                <div className="text-slate-300">
                                    {expandedSessionId === session.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {/* Detailed Dropdown */}
                            {expandedSessionId === session.id && (
                                <div className="border-t border-slate-100 bg-slate-50/50 p-2 text-sm space-y-2 max-h-80 overflow-y-auto">
                                    {/* Metadata Display in Detailed View */}
                                    <div className="flex gap-2 mb-2 text-[10px] text-slate-400 font-mono px-2">
                                        <span>{session.device || 'Unknown'}</span>
                                        {session.ip && <span>• {session.ip}</span>}
                                    </div>

                                    <div className="flex gap-2 mb-4 px-2">
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                const text = generateClipboardText(session);
                                                await copyToClipboard(text);
                                                alert("Tulemus kopeeritud!");
                                            }}
                                            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs py-1.5 px-3 rounded-full transition-colors"
                                        >
                                            <Share2 size={12} /> Kopeeri
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadCSV(session);
                                            }}
                                            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs py-1.5 px-3 rounded-full transition-colors"
                                        >
                                            <Download size={12} /> Lae CSV
                                        </button>
                                    </div>

                                    {session.questions.map((q, i) => (
                                        <div key={i} className="flex flex-col border-b border-slate-100 last:border-0 pb-1">
                                            <div className="flex justify-between px-2 py-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-400 w-4">{i + 1}.</span>
                                                    <span className={(q.attempts || []).length > 0 ? "text-orange-500 font-medium" : "text-slate-600"}>
                                                        {q.str || q.str} = {q.answer}
                                                    </span>
                                                </div>
                                                <span className={`font-mono ${q.isOvertime ? 'text-red-500' : 'text-green-600'}`}>
                                                    {(q.time || 0).toFixed(1)}s
                                                </span>
                                            </div>
                                            {/* Telemetry in History - Vertical List */}
                                            {q.attempts && q.attempts.length > 0 && (
                                                <div className="px-4 pb-1 flex flex-col gap-1 mt-1">
                                                    {q.attempts.map((att, aidx) => (
                                                        <div key={aidx} className="text-xs text-red-500 flex items-center gap-2">
                                                            <XCircle size={10} />
                                                            <span>Pakkus <span className="font-bold">{att.value}</span></span>
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
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StatsScreen;
