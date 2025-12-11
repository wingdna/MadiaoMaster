
import { AILearningState, ScoreResult, GameHistory, Difficulty, ViolationRecord } from '../types';

const DEFAULT_STATE: AILearningState = {
    playerId: -1,
    gamesPlayed: 0,
    winRate: 0,
    aggression: 0.5,     // 0.0 (保守) - 1.0 (激进)
    riskTolerance: 0.3,  // 0.0 (极度谨慎) - 1.0 (赌徒)
    bluffFrequency: 0.1, // 0.0 (从不诈唬) - 1.0 (频繁诈唬)
    lastRole: 'PEASANT',
    lastResult: 'DRAW'
};

// Key for LocalStorage
const STORAGE_KEY = 'ma_diao_ai_memory_v2_zh';

export const loadAIMemory = (): Record<number, AILearningState> => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn("读取AI记忆失败", e);
    }
    return {};
};

export const saveAIMemory = (states: Record<number, AILearningState>) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
    } catch (e) {
        console.warn("保存AI记忆失败", e);
    }
};

export const getAIState = (playerId: number, history: GameHistory): AILearningState => {
    if (history.aiLearningStates && history.aiLearningStates[playerId]) {
        return history.aiLearningStates[playerId];
    }
    return { ...DEFAULT_STATE, playerId };
};

/**
 * 根据回合结果动态调整AI个性参数。
 * 策略核心："赢则强化，输则调整" (Win-Stay, Lose-Shift)。
 * 包含对“违例惩罚”的强负面反馈。
 */
export const updateAILearning = (
    currentState: AILearningState, 
    result: ScoreResult, 
    isBanker: boolean,
    difficulty: Difficulty
): AILearningState => {
    const newState = { ...currentState };
    newState.gamesPlayed += 1;
    newState.lastRole = isBanker ? 'BANKER' : 'PEASANT';

    // 判定胜负 (根据总分变动)
    const isWin = result.totalRoundChange > 0;
    newState.lastResult = isWin ? 'WIN' : (result.totalRoundChange < 0 ? 'LOSS' : 'DRAW');

    // 更新胜率 (移动平均)
    const prevWins = newState.winRate * (newState.gamesPlayed - 1);
    newState.winRate = (prevWins + (isWin ? 1 : 0)) / newState.gamesPlayed;

    // --- 1. 惩罚反馈机制 (Penalty Feedback) ---
    // 如果AI本局出现了违例（包赔或警告），立即进行负面强化。
    if (result.violations && result.violations.length > 0) {
        // 大幅降低风险容忍度，变成“惊弓之鸟”
        newState.riskTolerance = Math.max(0.05, newState.riskTolerance - 0.25);

        // 检查违例类型以调整特定性格
        const hasAggressiveViolation = result.violations.some(v => 
            v.ruleId.includes('JI_ZHUO') ||  // 急捉
            v.ruleId === 'KAI_JIN_MEN' ||    // 开禁门
            v.ruleId === 'GUA_WAN'           // 挂万
        );

        const hasCarelessViolation = result.violations.some(v => 
            v.ruleId.includes('MIE') ||      // 灭牌错误
            v.ruleId === 'LOU_ZHUANG' ||     // 漏庄
            v.ruleId === 'ZONG_ZHUANG'       // 纵庄
        );

        if (hasAggressiveViolation) {
            // 因太激进而犯错 -> 降低激进值
            newState.aggression = Math.max(0.1, newState.aggression - 0.2);
        }

        if (hasCarelessViolation) {
            // 因太随意而犯错 -> 降低诈唬/随意出牌频率
            newState.bluffFrequency = Math.max(0, newState.bluffFrequency - 0.1);
        }
        
        // 惩罚是最高优先级的反馈，处理完后直接返回，覆盖常规逻辑
        return newState; 
    } 

    // --- 2. 赢则强化，输则调整 (Win-Stay, Lose-Shift) ---
    
    const adjustmentRate = 0.05; // 调整步长

    if (isWin) {
        // **赢了 (Win-Stay)**：强化当前风格
        
        // 如果是激进获胜，变得更自信（激进）
        if (newState.aggression > 0.5) newState.aggression = Math.min(1.0, newState.aggression + adjustmentRate);
        // 如果是保守获胜，变得更沉稳（保守/低激进）
        else newState.aggression = Math.max(0.0, newState.aggression - adjustmentRate);
        
        // 如果冒了风险还赢了，增加风险容忍度
        if (newState.riskTolerance > 0.4) {
            newState.riskTolerance = Math.min(0.9, newState.riskTolerance + adjustmentRate);
        }

    } else {
        // **输了 (Lose-Shift)**：改变策略
        
        // 如果太激进导致输，尝试保守一点
        if (newState.aggression > 0.6) {
            newState.aggression -= (adjustmentRate * 2);
        } 
        // 如果太保守导致输（错失机会），尝试激进一点
        else if (newState.aggression < 0.4) {
            newState.aggression += (adjustmentRate * 2);
        }

        // 输了通常意味着需要更谨慎
        newState.riskTolerance = Math.max(0.1, newState.riskTolerance - adjustmentRate);
    }

    // --- 3. 难度系数修正 ---
    if (difficulty === Difficulty.HARD) {
        // 困难AI：参数趋向于优化值（通常激进和容忍度适中偏高能带来高收益，但要守规则）
        // 确保不会因为连续失败变得太“怂”
        newState.riskTolerance = Math.max(0.2, newState.riskTolerance); 
        newState.aggression = Math.max(0.3, newState.aggression);
    } else if (difficulty === Difficulty.EASY) {
        // 简单AI：保持高风险容忍度（容易犯错）
        newState.riskTolerance = Math.min(0.8, Math.max(0.5, newState.riskTolerance)); 
    }

    return newState;
};
