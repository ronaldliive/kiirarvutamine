import React, { useState } from 'react';
import { Settings as SettingsIcon, BarChart2 } from 'lucide-react';
import SettingsModal from './SettingsModal';
import { Settings } from '../../types';

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
    const targetTimePerQuestion = (settings.timeMinutes * 60) / settings.questionCount;

    return (
        <div className="flex-grow flex flex-col items-center justify-center p-6 relative">
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-4xl font-bold text-slate-700">Kiirarvutamine</h1>
                <p className="text-slate-400">Vali raskusaste</p>
            </div>

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
            </div>

            <button
                onClick={goToCustom}
                className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 p-2 bg-white rounded-full shadow-sm z-50 active:scale-95 transition-transform"
            >
                <SettingsIcon size={28} />
            </button>

            <button
                onClick={goToStats}
                className="absolute top-6 right-6 text-slate-400 hover:text-zen-accent p-2 bg-white rounded-full shadow-sm z-50 active:scale-95 transition-transform"
            >
                <BarChart2 size={24} />
            </button>

            <div className="text-sm text-slate-300 text-center max-w-xs absolute bottom-8">
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
