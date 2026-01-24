import React from 'react';
import { Delete, CheckCircle2 } from 'lucide-react';

const Keypad = ({ onInput, onDelete, onCheck }) => {
    return (
        <div className="flex-none p-4 pb-safe bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <button
                        key={n}
                        onClick={() => onInput(n.toString())}
                        className="h-14 sm:h-16 rounded-2xl bg-slate-50 text-3xl font-semibold text-slate-700 shadow-sm active:bg-slate-200 transition-colors border border-slate-100"
                    >
                        {n}
                    </button>
                ))}
                <button
                    onClick={onDelete}
                    className="h-14 sm:h-16 rounded-2xl bg-slate-100 text-slate-500 shadow-sm flex items-center justify-center active:bg-slate-200 transition-colors border border-slate-200"
                >
                    <Delete size={32} />
                </button>
                <button
                    onClick={() => onInput('0')}
                    className="h-14 sm:h-16 rounded-2xl bg-slate-50 text-3xl font-semibold text-slate-700 shadow-sm active:bg-slate-200 transition-colors border border-slate-100"
                >
                    0
                </button>
                <button
                    onClick={onCheck}
                    className="h-14 sm:h-16 rounded-2xl bg-green-50 text-green-600 shadow-sm flex items-center justify-center active:bg-green-100 transition-colors border border-green-100"
                >
                    <CheckCircle2 size={32} />
                </button>
            </div>
        </div>
    );
};

export default Keypad;
