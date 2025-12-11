
import { useState } from 'react';
import { Difficulty, SupportedLanguage } from '../types';

export interface GameSettings {
    language: SupportedLanguage;
    setLanguage: (lang: SupportedLanguage) => void;
    difficulty: Difficulty;
    setDifficulty: (diff: Difficulty) => void;
    oneClickPlay: boolean;
    setOneClickPlay: (enable: boolean) => void;
    isMuted: boolean;
    setIsMuted: (muted: boolean) => void;
    isRiskAlertOn: boolean;
    setIsRiskAlertOn: (on: boolean) => void;
    showSuitHistory: boolean;
    setShowSuitHistory: (show: boolean) => void;
    graphicsQuality: 'HIGH' | 'LOW';
    setGraphicsQuality: (quality: 'HIGH' | 'LOW') => void;
}

export const useGameSettings = (): GameSettings => {
    // Default settings
    const [language, setLanguage] = useState<SupportedLanguage>('zh_CN');
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
    const [oneClickPlay, setOneClickPlay] = useState<boolean>(true);
    const [isMuted, setIsMuted] = useState<boolean>(true); // Default Muted for better UX on load
    const [isRiskAlertOn, setIsRiskAlertOn] = useState<boolean>(true);
    const [showSuitHistory, setShowSuitHistory] = useState<boolean>(true);
    
    // Auto-detect mobile to set LOW quality by default for performance
    const [graphicsQuality, setGraphicsQuality] = useState<'HIGH' | 'LOW'>(
        typeof window !== 'undefined' && window.innerWidth < 768 ? 'LOW' : 'HIGH'
    );

    return {
        language, setLanguage,
        difficulty, setDifficulty,
        oneClickPlay, setOneClickPlay,
        isMuted, setIsMuted,
        isRiskAlertOn, setIsRiskAlertOn,
        showSuitHistory, setShowSuitHistory,
        graphicsQuality, setGraphicsQuality
    };
};
