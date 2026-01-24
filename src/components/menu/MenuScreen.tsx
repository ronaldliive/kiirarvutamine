import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, BarChart2, Flame } from 'lucide-react';
import SettingsModal from './SettingsModal';
import { Settings } from '../../types';
import { getStreak } from '../../services/storageService';

interface MenuScreenProps {
    onStart: (limit: number) => void;
    settings: Settings;
    onSaveSettings: (settings: Settings) => void;
    goToStats: () => void;
    goToCustom: () => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({
    onStart,
    settings,
    onSaveSettings,
    goToStats,
    goToCustom
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const [streak, setStreak] = useState(0);
    const targetTimePerQuestion = (settings.timeMinutes * 60) / settings.questionCount;

    useEffect(() => {
        const s = getStreak();
        setStreak(s.currentStreak);
    }, []);

    return (
        <div className="flex-grow flex flex-col items-center justify-center p-6 relative bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-4xl font-bold text-slate-700 dark:text-white transition-colors">Kiirarvutamine</h1>
                <p className="text-slate-400 dark:text-slate-500">Vali raskusaste</p>
            </div>

            {/* Streak Badge */}
            {streak > 0 && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <Flame size={16} className="fill-orange-500" />
                    <span className="font-bold text-sm">{streak} päev{streak !== 1 && 'a'}</span>
                </div>
            )}

            <div className="w-full max-w-sm space-y-4 mb-12">
                <button
                    onClick={() => onStart(10)}
                    className="w-full bg-zen-accent hover:bg-sky-500 text-white py-6 rounded-3xl text-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    10 piires
                </button>
                <button
                    onClick={() => onStart(20)}
                    className="w-full bg-zen-accent hover:bg-sky-500 text-white py-6 rounded-3xl text-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    20 piires
                </button>
                <button
                    onClick={() => onStart(30)}
                    className="w-full bg-zen-accent hover:bg-sky-500 text-white py-6 rounded-3xl text-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    30 piires
                </button>
            </div>

            <button
                onClick={goToCustom}
                className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm z-50 active:scale-95 transition-all"
            >
                <SettingsIcon size={28} />
            </button>

            <button
                onClick={goToStats}
                className="absolute top-6 right-6 text-slate-400 hover:text-zen-accent dark:text-slate-500 dark:hover:text-zen-accent p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm z-50 active:scale-95 transition-all"
            >
                <BarChart2 size={24} />
            </button>

            <div className="text-sm text-slate-300 dark:text-slate-600 text-center max-w-xs absolute bottom-8">
                Eesmärk: {settings.questionCount} tehet<br />
                Tempo: {targetTimePerQuestion.toFixed(1).replace('.', ',')}s tehte kohta
            </div>

            {/* Settings Modal */}
            <SettingsModal
                show={showSettings}
                onClose={() => setShowSettings(false)}
                settings={settings}
                onSave={onSaveSettings}
            />
        </div>
    );
};

export default MenuScreen;
