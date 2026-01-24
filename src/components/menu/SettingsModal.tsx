import React from 'react';
import { X } from 'lucide-react';
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
        <div className="absolute inset-0 z-50 bg-black/20 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-700">Seaded</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Tehete arv (eesmärk)</label>
                        <input
                            type="number"
                            value={settings.questionCount}
                            onChange={(e) => {
                                const val = e.target.value;
                                const num = parseInt(val);
                                if (val === '' || !isNaN(num)) {
                                    if (val === '') {
                                        // @ts-ignore - Temporary allowance for empty string input handling before blur
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
                            className="w-full text-center text-2xl font-bold p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zen-accent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Aeg kokku (minutites)</label>
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
                            className="w-full text-center text-2xl font-bold p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zen-accent"
                        />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-xl text-center">
                        <p className="text-xs text-blue-400 uppercase font-bold mb-1">Arvutatud tempo</p>
                        <p className="text-3xl font-bold text-blue-600 flex justify-center items-baseline gap-1">
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
