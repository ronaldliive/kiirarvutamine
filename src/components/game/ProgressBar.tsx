import React from 'react';
import { X } from 'lucide-react';

interface ProgressBarProps {
    timeRatio: number;
    isOvertime: boolean;
    displayTime: string;
    onQuit: () => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    timeRatio,
    isOvertime,
    displayTime,
    onQuit
}) => {
    const barColor = isOvertime ? 'bg-red-500' : 'bg-green-500';

    return (
        <div className="flex-none h-10 w-full bg-slate-100 relative z-20 flex items-center justify-between">
            <div className="absolute inset-0 w-full h-full bg-slate-200">
                <div
                    className={`h-full transition-all duration-100 ease-linear ${barColor}`}
                    style={{ width: isOvertime ? '100%' : `${timeRatio * 100}%` }}
                />
            </div>

            <div className="absolute inset-0 flex items-center justify-between px-4">
                <span className="text-xs font-bold text-slate-600/80 w-10 text-center bg-white/50 rounded p-0.5 backdrop-blur-sm">
                    {displayTime}s
                </span>

                <button
                    onClick={onQuit}
                    className="text-slate-500 hover:text-red-500 bg-white/50 rounded-full p-1 backdrop-blur-sm transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default ProgressBar;
