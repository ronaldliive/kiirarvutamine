import React from 'react';
import { Delete, CheckCircle2 } from 'lucide-react';

interface KeypadProps {
    onInput: (digit: string) => void;
    onDelete: () => void;
    onCheck: () => void;
}

const Keypad: React.FC<KeypadProps> = ({ onInput, onDelete, onCheck }) => {
    return (
        <div className="flex-none p-4 pb-safe bg-white dark:bg-slate-800 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none z-20 border-t border-slate-100 dark:border-slate-700 transition-colors duration-300">
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <button
                        key={n}
                        onClick={() => onInput(n.toString())}
                        className="h-14 sm:h-16 rounded-2xl bg-slate-50 dark:bg-slate-700 text-3xl font-semibold text-slate-700 dark:text-white shadow-sm active:bg-slate-200 dark:active:bg-slate-600 transition-colors border border-slate-100 dark:border-slate-600"
                    >
                        {n}
                    </button>
                ))}
                <button
                    onClick={onDelete}
                    className="h-14 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 shadow-sm flex items-center justify-center active:bg-slate-200 dark:active:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
                >
                    <Delete size={32} />
                </button>
                <button
                    onClick={() => onInput('0')}
                    className="h-14 sm:h-16 rounded-2xl bg-slate-50 dark:bg-slate-700 text-3xl font-semibold text-slate-700 dark:text-white shadow-sm active:bg-slate-200 dark:active:bg-slate-600 transition-colors border border-slate-100 dark:border-slate-600"
                >
                    0
                </button>
                <button
                    onClick={onCheck}
                    className="h-14 sm:h-16 rounded-2xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 shadow-sm flex items-center justify-center active:bg-green-100 dark:active:bg-green-900/50 transition-colors border border-green-100 dark:border-green-800"
                >
                    <CheckCircle2 size={32} />
                </button>
            </div>
        </div>
    );
};

export default Keypad;
