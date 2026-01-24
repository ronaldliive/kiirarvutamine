import React from 'react';

interface OperatorKeypadProps {
    onInput: (op: string) => void;
}

const OperatorKeypad: React.FC<OperatorKeypadProps> = ({ onInput }) => {
    const ops = ['+', '-', '*', '/'];

    return (
        <div className="flex-none p-4 pb-safe bg-white dark:bg-slate-800 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 border-t border-slate-100 dark:border-slate-700">
            <div className="grid grid-cols-4 gap-3">
                {ops.map((op) => (
                    <button
                        key={op}
                        onClick={() => onInput(op)}
                        className="h-20 rounded-2xl bg-slate-50 dark:bg-slate-700 text-4xl font-bold text-slate-700 dark:text-white shadow-sm active:bg-slate-200 dark:active:bg-slate-600 transition-colors border border-slate-100 dark:border-slate-600 flex items-center justify-center"
                    >
                        {op === '*' ? '×' : op === '/' ? '÷' : op}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default OperatorKeypad;
