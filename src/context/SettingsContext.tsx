import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
    fontSize: number;
    lineHeight: number;
    theme: 'dark' | 'light';
    fontFamily: string;
    viewMode: 'hybrid' | 'split';
}

interface SettingsContextType extends Settings {
    updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
    fontSize: 16,
    lineHeight: 1.6,
    theme: 'dark',
    fontFamily: 'sans',
    viewMode: 'hybrid',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        const saved = localStorage.getItem('tauri-md-settings');
        if (saved) {
            try {
                return { ...defaultSettings, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to parse settings:', e);
            }
        }
        return defaultSettings;
    });

    useEffect(() => {
        localStorage.setItem('tauri-md-settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <SettingsContext.Provider value={{ ...settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
