import { useState } from 'react';
import { getSettings, saveSettings as persistSettings } from '../services/storageService';

export const useSettings = () => {
    const [settings, setSettings] = useState(() => getSettings());

    const saveSettings = (newSettings) => {
        setSettings(newSettings);
        persistSettings(newSettings);
    };

    return {
        settings,
        saveSettings
    };
};
