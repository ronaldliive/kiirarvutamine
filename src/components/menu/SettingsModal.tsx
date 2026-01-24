import React from 'react';
import { X, Moon, Sun } from 'lucide-react';
import { Settings } from '../../types';

interface SettingsModalProps {
    show: boolean;
    onClose: () => void;
    settings: Settings;
    onSave: (settings: Settings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ show, onClose, settings, onSave }) => {
    if (!show) return null;

    const targetTimePerQuestion = (settings.timeMinutes * 60) / settings.questionCount;

    return (
        <div className="absolute inset-0 z-50 bg-black/20 dark:bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-xs p-6 space-y-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-700 dark:text-white">Seaded</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-3 rounded-xl">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-200 font-medium">
                            {settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
                            <span>Tume režiim</span>
                        </div>
                        <button
                            onClick={() => onSave({ ...settings, darkMode: !settings.darkMode })}
                            className={`w-12 h-6 rounded-full p-1 transition-colors relative ${settings.darkMode ? 'bg-indigo-500' : 'bg-slate-300'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${settings.darkMode ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Tehete arv (eesmärk)</label>
                        <input
                            type="number"
                            value={settings.questionCount}
                            onChange={(e) => {
                                const val = e.target.value;
                                const num = parseInt(val);
                                if (val === '' || !isNaN(num)) {
                                    if (val === '') {
                                        // @ts-ignore
                                        onSave({ ...settings, questionCount: '' });
                                    } else {
                                        onSave({ ...settings, questionCount: num });
                                    }
                                }
                            }}
                            onBlur={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                if (val < 1) {
                                    onSave({ ...settings, questionCount: 1 });
                                }
                            }}
                            className="w-full text-center text-2xl font-bold p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zen-accent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Aeg kokku (minutites)</label>
                        <input
                            type="number"
                            value={settings.timeMinutes}
                            onChange={(e) => {
                                const val = e.target.value;
                                const num = parseInt(val);
                                if (val === '' || !isNaN(num)) {
                                    if (val === '') {
                                        // @ts-ignore
                                        onSave({ ...settings, timeMinutes: '' });
                                    } else {
                                        onSave({ ...settings, timeMinutes: num });
                                    }
                                }
                            }}
                            onBlur={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                if (val < 1) {
                                    onSave({ ...settings, timeMinutes: 1 });
                                }
                            }}
                            className="w-full text-center text-2xl font-bold p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zen-accent"
                        />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl text-center">
                        <p className="text-xs text-blue-400 uppercase font-bold mb-1">Arvutatud tempo</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex justify-center items-baseline gap-1">
                            {targetTimePerQuestion.toFixed(1).replace('.', ',')}
                            <span className="text-sm font-medium text-blue-400">sek/tehe</span>
                        </p>
                    </div>

                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-zen-accent hover:bg-sky-500 text-white rounded-xl font-bold shadow-md transition-colors"
                >
                    Salvesta
                </button>
            </div>
        </div>
    );
};

export default SettingsModal;
