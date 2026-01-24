import { useState } from 'react';
import { getSettings, saveSettings as persistSettings } from '../services/storageService';
import { Settings } from '../types';

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(() => getSettings());

    const saveSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        persistSettings(newSettings);
    };

    return {
        settings,
        saveSettings
    };
};
