
import { useState, useEffect } from 'react';
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
    githubAutoSync: boolean;
    setGithubAutoSync: (auto: boolean) => void;
    showPaperDolls: boolean;
    setShowPaperDolls: (show: boolean) => void;
    isMobileDevice: boolean; // Exposed for UI to hide controls
}

export const useGameSettings = (): GameSettings => {
    // Default settings
    const [language, setLanguage] = useState<SupportedLanguage>('zh_CN');
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
    const [oneClickPlay, setOneClickPlay] = useState<boolean>(true);
    const [isMuted, setIsMuted] = useState<boolean>(true); 
    const [isRiskAlertOn, setIsRiskAlertOn] = useState<boolean>(true);
    const [showSuitHistory, setShowSuitHistory] = useState<boolean>(true);
    const [githubAutoSync, setGithubAutoSync] = useState<boolean>(true); 
    
    // Robust Mobile Detection
    const [isMobileDevice, setIsMobileDevice] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            // Check both width and user agent for robustness
            const isMobileWidth = window.innerWidth < 1024;
            const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            setIsMobileDevice(isMobileWidth || isMobileUA);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const [graphicsQuality, setGraphicsQuality] = useState<'HIGH' | 'LOW'>('HIGH');
    
    // Internal state for Paper Dolls (for desktop users)
    const [internalShowPaperDolls, setInternalShowPaperDolls] = useState<boolean>(true);

    // Effect to enforce LOW quality on mobile automatically
    useEffect(() => {
        if (isMobileDevice) {
            setGraphicsQuality('LOW');
        }
    }, [isMobileDevice]);

    return {
        language, setLanguage,
        difficulty, setDifficulty,
        oneClickPlay, setOneClickPlay,
        isMuted, setIsMuted,
        isRiskAlertOn, setIsRiskAlertOn,
        showSuitHistory, setShowSuitHistory,
        graphicsQuality, setGraphicsQuality,
        githubAutoSync, setGithubAutoSync,
        
        // HARD OVERRIDE: If mobile, ALWAYS false. User preference is ignored.
        showPaperDolls: isMobileDevice ? false : internalShowPaperDolls,
        setShowPaperDolls: setInternalShowPaperDolls,
        isMobileDevice
    };
};
