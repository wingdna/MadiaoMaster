
import { GameHistory, MatchLogEntry } from '../types';
import { loadAIMemory } from './aiLearningService';
import { syncGameStats, initSupabase, getSupabaseConfig } from './cloudService';

const STATS_KEY = 'ma_diao_stats_v1';

// Init Cloud if keys exist on load - WRAPPED IN TRY/CATCH to prevent top-level module crash
try {
    const config = getSupabaseConfig();
    if (config.url && config.key) {
        initSupabase(config.url, config.key);
    }
} catch (e) {
    console.warn("Failed to auto-init cloud service:", e);
}

export const loadGameStats = (): GameHistory => {
    const defaults: GameHistory = {
        totalRounds: 0,
        bankerWins: 0,
        peasantWins: 0,
        lastRoundWinnerType: 'DRAW',
        aggressionModifier: 0,
        aiLearningStates: loadAIMemory(),
        matchLogs: [] // Initialize empty logs
    };
    try {
        const stored = localStorage.getItem(STATS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return { 
                ...defaults, 
                ...parsed, 
                // Ensure matchLogs exists if loading from old data
                matchLogs: parsed.matchLogs || [],
                aiLearningStates: loadAIMemory() 
            };
        }
    } catch(e) { 
        console.error("Failed to load stats", e); 
    }
    return defaults;
};

export const saveGameStats = (history: GameHistory) => {
    try {
        // Exclude aiLearningStates from this key as they are managed by aiLearningService
        const { aiLearningStates, ...stats } = history; 
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        
        // Sync with Cloud
        syncGameStats(history);
    } catch(e) { 
        console.error("Failed to save stats", e); 
    }
};

export const clearGameStats = () => {
    localStorage.removeItem(STATS_KEY);
};

export const addMatchLog = (history: GameHistory, entry: MatchLogEntry): GameHistory => {
    // Keep only the last 20 matches locally to prevent unlimited storage growth
    const updatedLogs = [entry, ...(history.matchLogs || [])].slice(0, 20);
    return {
        ...history,
        matchLogs: updatedLogs
    };
};
