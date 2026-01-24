import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, BarChart2, Flame, Search, Calculator, BrainCircuit, ArrowRight, Sliders } from 'lucide-react';
import SettingsModal from './SettingsModal';
import { Settings, GameMode, CustomConfig } from '../../types';
import { getStreak, getSessions } from '../../services/storageService';
import { analyzeWeaknesses, Recommendation } from '../../services/analysisService';

interface MenuScreenProps {
    onStart: (limit: number | CustomConfig, mode: GameMode) => void;
    settings: Settings;
    onSaveSettings: (settings: Settings) => void;
    goToStats: () => void;
    goToCustom: (mode: GameMode) => void;
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
    const [mode, setMode] = useState<GameMode>('standard');
    const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
    const targetTimePerQuestion = (settings.timeMinutes * 60) / settings.questionCount;

    useEffect(() => {
        const s = getStreak();
        setStreak(s.currentStreak);

        // Analyze for trainer
        const sessions = getSessions();
        const rec = analyzeWeaknesses(sessions);
        setRecommendation(rec);
    }, []);

    return (
        <div className="h-[100dvh] w-screen flex flex-col items-center justify-center p-6 relative bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-y-auto">
            <div className="text-center space-y-2 mb-6 mt-8">
                <h1 className="text-4xl font-bold text-slate-700 dark:text-white transition-colors">Kiirarvutamine</h1>
                <p className="text-slate-400 dark:text-slate-500">Vali mänguviis</p>
            </div>

            {/* Mode Switcher */}
            <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-1 mb-6">
                <button
                    onClick={() => setMode('standard')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${mode === 'standard'
                        ? 'bg-zen-accent text-white shadow-md'
                        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                >
                    <Calculator size={20} /> Tavaline
                </button>
                <button
                    onClick={() => setMode('detective')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${mode === 'detective'
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                >
                    <Search size={20} /> Puuduv tehe
                </button>
            </div>

            {/* Smart Trainer Recommendation */}
            {recommendation && (
                <div className="w-full max-w-sm mb-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-4 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-indigo-100 dark:text-indigo-900/20">
                            <BrainCircuit size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                                <BrainCircuit size={18} />
                                {recommendation.title}
                            </div>
                            <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium mb-1">
                                {recommendation.description}
                            </p>
                            <p className="text-xs text-indigo-400 mb-3">{recommendation.reason}</p>

                            <button
                                onClick={() => onStart(recommendation.config, 'standard')}
                                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                Tee eritreening <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Streak Badge */}
            {streak > 0 && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <Flame size={16} className="fill-orange-500" />
                    <span className="font-bold text-sm">{streak} päev{streak !== 1 && 'a'}</span>
                </div>
            )}

            <div className="w-full max-w-sm space-y-4 mb-12">
                <button
                    onClick={() => onStart(10, mode)}
                    className={`w-full text-white py-6 rounded-3xl text-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3
                        ${mode === 'detective' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-zen-accent hover:bg-sky-500'}
                    `}
                >
                    10 piires
                </button>
                <button
                    onClick={() => onStart(20, mode)}
                    className={`w-full text-white py-6 rounded-3xl text-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3
                        ${mode === 'detective' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-zen-accent hover:bg-sky-500'}
                    `}
                >
                    20 piires
                </button>
                <button
                    onClick={() => onStart(30, mode)}
                    className={`w-full text-white py-6 rounded-3xl text-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3
                        ${mode === 'detective' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-zen-accent hover:bg-sky-500'}
                    `}
                >
                    30 piires
                </button>
            </div>

            {/* Top Left Buttons */}
            <div className="absolute top-6 left-6 flex gap-3 z-50">
                <button
                    onClick={() => setShowSettings(true)}
                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm active:scale-95 transition-all"
                >
                    <SettingsIcon size={24} />
                </button>
                <button
                    onClick={() => goToCustom(mode)}
                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm active:scale-95 transition-all"
                    title="Kohanda mängu"
                >
                    <Sliders size={24} />
                </button>
            </div>

            {/* Top Right Buttons */}
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
