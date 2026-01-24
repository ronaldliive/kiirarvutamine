import React from 'react';
import { XCircle } from 'lucide-react';
import { Settings, CustomConfig } from '../../types';

interface CustomSetupProps {
    settings: Settings;
    customConfig: CustomConfig;
    setCustomConfig: (config: CustomConfig) => void;
    onSaveSettings: (settings: Settings) => void;
    onStart: (config: CustomConfig) => void;
    onBack: () => void;
}

const CustomSetup: React.FC<CustomSetupProps> = ({
    settings,
    customConfig,
    setCustomConfig,
    onSaveSettings,
    onStart,
    onBack
}) => {
    return (
        <div className="h-[100dvh] w-screen flex flex-col items-center justify-center p-6 relative bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-6 space-y-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold text-slate-700 dark:text-white">Kohanda mängu</h2>
                    <button onClick={onBack} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <XCircle size={28} />
                    </button>
                </div>

                {/* Global Settings (Time & Count) */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Tehteid</label>
                        <input
                            type="number"
                            value={settings.questionCount}
                            onChange={(e) => onSaveSettings({ ...settings, questionCount: parseInt(e.target.value) || 1 })}
                            className="w-full text-center text-xl font-bold p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Aeg (min)</label>
                        <input
                            type="number"
                            value={settings.timeMinutes}
                            onChange={(e) => onSaveSettings({ ...settings, timeMinutes: parseInt(e.target.value) || 1 })}
                            className="w-full text-center text-xl font-bold p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-700" />

                {/* Max Value Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Suurim arv</label>
                    <input
                        type="number"
                        value={customConfig.max}
                        onChange={(e) => setCustomConfig({ ...customConfig, max: parseInt(e.target.value) || 20 })}
                        className="w-full text-center text-3xl font-bold p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white focus:border-zen-accent focus:outline-none"
                    />
                </div>

                {/* Operators Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Vali tehted</label>
                    <div className="grid grid-cols-4 gap-3">
                        {['+', '-', '*', '/'].map(op => {
                            const isActive = customConfig.ops.includes(op);
                            return (
                                <button
                                    key={op}
                                    onClick={() => {
                                        const currentOps = customConfig.ops;
                                        let newOps: string[];
                                        if (isActive) {
                                            if (currentOps.length === 1) return;
                                            newOps = currentOps.filter(o => o !== op);
                                        } else {
                                            newOps = [...currentOps, op];
                                        }
                                        setCustomConfig({ ...customConfig, ops: newOps });
                                    }}
                                    className={`h-14 rounded-xl text-2xl font-bold flex items-center justify-center transition-all ${isActive
                                        ? 'bg-zen-accent text-white shadow-md'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {op === '*' ? '×' : op === '/' ? '÷' : op}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button
                    onClick={() => onStart(customConfig)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl text-xl font-bold shadow-lg transition-transform active:scale-95 mt-4"
                >
                    Alusta
                </button>
            </div>
        </div>
    );
};

export default CustomSetup;
