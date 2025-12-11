
import { useState } from 'react';

export type SettingsTab = 'GENERAL' | 'RECORDER' | 'HISTORY';

export interface UIState {
    showSettings: boolean;
    setShowSettings: (show: boolean) => void;
    activeSettingsTab: SettingsTab;
    setActiveSettingsTab: (tab: SettingsTab) => void;
    showSocialModal: boolean;
    setShowSocialModal: (show: boolean) => void;
}

export const useUIState = (): UIState => {
    const [showSettings, setShowSettings] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('GENERAL');
    const [showSocialModal, setShowSocialModal] = useState(false);

    return {
        showSettings, setShowSettings,
        activeSettingsTab, setActiveSettingsTab,
        showSocialModal, setShowSocialModal
    };
};
