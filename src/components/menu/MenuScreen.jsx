import React, { useState } from 'react';
import { Settings, BarChart2 } from 'lucide-react';
import SettingsModal from './SettingsModal';

const MenuScreen = ({
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
                <Settings size={28} />
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

            {/* 
         Previous implementation had Settings trigger on Settings icon inside menu?
         Wait, in original App.jsx:
         onClick={() => setGameState('custom_setup')} for Settings icon (left)
         BUT there was ALSO a SettingsModal that appeared when?
         Ah, checking original file:
         Lines 769-855 is SettingsModal, rendered when `showSettings` is true.
         But where is `setShowSettings(true)` called?
         Line 751 calls `setGameState('custom_setup')` on left settings icon.
         Wait, I need to check if there was a hidden way to open SettingsModal or if I misread.
         
         Looking at App.jsx Phase 1:
         Line 288: const [showSettings, setShowSettings] = useState(false);
         Line 769: {showSettings && ( ... logic ... )}
         
         But how is showSettings set to true?
         I don't see any usages of setShowSettings(true) in the visible snippets.
         Let me re-read App.jsx snippet carefully.
         
         Ah, line 750: top-left button sets gameState to 'custom_setup'.
         Custom Setup screen HAS settings (lines 980-998).
         So the separate SettingsModal might be legacy or redundant code in the original App.jsx 
         OR I missed where it's triggered.
         
         Wait, line 750 logic:
            onClick={() => setGameState('custom_setup')}
            
         So the detailed "Settings Modal" lines 769-855 might be unreachable code 
         unless I missed a button.
         
         Actually, the user asked to "Consolidate Settings" in a previous conversation (Context 37).
         "ensure custom game settings ... and general settings ... are now integrated into a single 'Kohanda mängu' view".
         
         So `SettingsModal` inside MenuScreen might be dead code in my new architecture if I follow the new pattern.
         However, for safety, I will implement it but note that the main path is Custom Setup.
         
         Actually, looking at MenuScreen code I just wrote:
         Left button calls `goToCustom`.
         Right button calls `goToStats`.
         
         So `SettingsModal` is indeed not used in the main flow anymore.
         BUT, I see `showSettings` state in `MenuScreen`. 
         I should probably remove it if it's not triggered.
         
         Let's stick to the original App.jsx logic:
         The original App.jsx had `showSettings` state.
         BUT the button at 751 triggered `custom_setup`.
         So maybe the modal was effectively disabled/hidden in favor of the full screen setup.
         
         I will NOT use SettingsModal in MenuScreen for now, 
         since the left button goes to CustomSetup.
      */}
        </div>
    );
};

export default MenuScreen;
