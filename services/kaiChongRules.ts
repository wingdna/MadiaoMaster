
import { Card, Suit, CardRank, CardColor, KaiChongDetail, SpecialCaptureFlags } from '../types';
import { 
    ID_WAN_WAN, ID_QIAN_WAN, ID_BAI_WAN, ID_20_WAN, ID_90_WAN
} from '../constants';

// --- CONFIGURATION ---
// Values updated to represent the actual Jin Zhang (Red/Green) anchors
const SUIT_CONFIG = {
    [Suit.TEXTS]: { 
        viceShoulderVal: 10, // Ban Wen (Red)
        viceExtremeVal: 1,   // 9 Wen (Green)
    },
    [Suit.CASH]: {
        viceShoulderVal: 9,  // Bai Wan (Red) - Note: 90(8) is Qing
        viceExtremeVal: 1,   // 20 Wan (Green)
    },
    [Suit.STRINGS]: {
        viceShoulderVal: 8,  // 8 Guan (Red)
        viceExtremeVal: 1    // 1 Guan (Green)
    },
    [Suit.COINS]: {
        viceShoulderVal: 8,  // 8 Suo (Red)
        viceExtremeVal: 1    // 1 Suo (Green)
    }
};

// --- HELPERS ---

const isBigFourCash = (value: number) => [11, 10, 9, 1].includes(value);
const isJinZhang = (card: Card) => card.color === CardColor.RED || card.color === CardColor.GREEN;

// Neighbor Check
const isNeighbor = (val1: number, val2: number, suit: Suit): boolean => {
    const diff = Math.abs(val1 - val2);
    if (diff === 1) return true;
    
    // Cyclic Rules
    if (suit === Suit.CASH || suit === Suit.TEXTS) {
        if ((val1 === 11 && val2 === 1) || (val1 === 1 && val2 === 11)) return true;
    } else {
        if ((val1 === 9 && val2 === 1) || (val1 === 1 && val2 === 9)) return true;
    }
    return false;
};

// Restricted Qing check
const isRestrictedQing = (val: number, suit: Suit): boolean => {
    // Determine the range of Qing cards based on Jin Zhang anchors
    const config = SUIT_CONFIG[suit];
    if (!config) return false;
    
    // Calculate range between the two anchors (exclusive)
    const min = Math.min(config.viceExtremeVal, config.viceShoulderVal);
    const max = Math.max(config.viceExtremeVal, config.viceShoulderVal);
    
    // Cash 90 (Value 8) is safe from generic restrictions, handled by specific rules below
    if (suit === Suit.CASH && val === 8) return false;

    // If value is strictly between anchors, it is a restricted Qing
    return val > min && val < max;
};

// Connectivity Check (BFS)
const checkConnectivity = (startVal: number, targetVal: number, suit: Suit, unionSet: Set<number>): boolean => {
    if (startVal === targetVal) return true;
    if (isNeighbor(startVal, targetVal, suit)) return true;

    // Special Cash Jump: 9 (Bai) connects to 8 (90)
    if (suit === Suit.CASH) {
        if ((startVal === 9 && targetVal === 8) || (startVal === 8 && targetVal === 9)) return true;
    }

    const visited = new Set<number>();
    const queue = [startVal];
    visited.add(startVal);

    while (queue.length > 0) {
        const current = queue.shift()!;
        
        // Check direct neighbor or special cash connection
        if (isNeighbor(current, targetVal, suit)) return true;
        if (suit === Suit.CASH && ((current === 9 && targetVal === 8) || (current === 8 && targetVal === 9))) return true;

        for (const uVal of unionSet) {
            if (!visited.has(uVal)) {
                let connected = isNeighbor(current, uVal, suit);
                if (!connected && suit === Suit.CASH) {
                    if ((current === 9 && uVal === 8) || (current === 8 && uVal === 9)) connected = true;
                }
                
                if (connected) {
                    visited.add(uVal);
                    queue.push(uVal);
                }
            }
        }
    }
    return false;
};

const hasRoot = (val: number, suit: Suit, uSet: Set<number>): boolean => {
    const config = SUIT_CONFIG[suit];
    if (!config) return false;

    if (uSet.has(config.viceShoulderVal) && checkConnectivity(val, config.viceShoulderVal, suit, uSet)) return true;
    if (uSet.has(config.viceExtremeVal) && checkConnectivity(val, config.viceExtremeVal, suit, uSet)) return true;
    // Cash 90 (8) is also a valid root/connector for Cash
    if (suit === Suit.CASH && uSet.has(8) && checkConnectivity(val, 8, suit, uSet)) return true;

    return false;
};

const getCaptureMultiplier = (card: Card, flags: SpecialCaptureFlags): number => {
    if (card.suit !== Suit.CASH) return 1;
    if (card.value === 11) {
        if (flags.wanCaughtQian && flags.qianCaughtBai) return 3;
        if (flags.wanCaughtQian || flags.wanCaughtBai) return 2;
    } else if (card.value === 10) {
        if (flags.qianCaughtBai) return 2;
    }
    return 1;
};

// --- SCORING LOGIC ---

export interface KaiChongScoreResult {
    score: number;
    matchType: 'TONG' | 'BROTHER' | 'SHUANG_LIN' | 'SHUN_LING' | 'DAN_CHONG' | 'JIAN_LING' | 'OTHER';
    description: string;
    validCards: Card[];
    priority: number;
}

export const evaluateKaiChong = (
    player: { capturedCards: Card[], id: number },
    potCard: Card,
    history: KaiChongDetail[],
    specialCaptures: SpecialCaptureFlags
): KaiChongScoreResult | null => {
    
    // Filter used
    const setB_Ids = new Set<string>();
    if (history) { history.forEach(h => { if (h.playerId === player.id) setB_Ids.add(h.matchedCard.id); }); }

    // U Set
    const uSet = new Set<number>();
    player.capturedCards.forEach(c => { if (c.suit === potCard.suit) uSet.add(c.value); });
    uSet.add(potCard.value); 

    const sourceCards = player.capturedCards.filter(c => c.suit === potCard.suit && !setB_Ids.has(c.id));
    if (sourceCards.length === 0) return null;

    let totalScore = 0;
    const validCards: Card[] = [];
    const descriptions: string[] = [];
    let minLinearDistance = 999; 

    // --- CHECK FOR SPECIAL CASH CASE: Bai(9) + 80(7) + Pot(90/8) ---
    if (potCard.suit === Suit.CASH && potCard.value === 8) {
        const baiCard = sourceCards.find(c => c.value === 9);
        const card80 = sourceCards.find(c => c.value === 7);
        
        if (baiCard && card80) {
            return {
                score: 5,
                matchType: 'JIAN_LING', 
                description: '间领冲 (5分): 百万顺冲(2) + 八十逆冲(3)',
                validCards: [baiCard, card80],
                priority: 0 
            };
        }
    }

    // Standard Logic
    for (const card of sourceCards) {
        let score = 0;
        let desc = '';
        let multiplier = getCaptureMultiplier(card, specialCaptures);
        const sVal = card.value;
        const pVal = potCard.value;
        const suit = card.suit;

        // RULE: Jian Restriction (General)
        if (card.rank === CardRank.JIAN) {
            const zunVal = (suit === Suit.CASH || suit === Suit.TEXTS) ? 11 : 9;
            if (!uSet.has(zunVal)) continue; 
        }

        // RULE: Cash Suit Special - "Jiushi (90)" acts as Shoulder
        // It cannot match with Qing (e.g. 80, 70...) unless Bai (9) is in Union Set.
        if (suit === Suit.CASH) {
            const isOne90 = (sVal === 8 || pVal === 8);
            const isOneQing = (sVal < 8 && sVal > 1) || (pVal < 8 && pVal > 1); // 20(1) is Ji, treated differently. Qing is 2-7.
            
            if (isOne90 && isOneQing) {
                // Must have Bai Wan (9) in uSet to activate 90
                if (!uSet.has(9)) continue; 
            }
        }
        
        // 1. Jin vs Jin
        if (isJinZhang(card) && isJinZhang(potCard)) {
            if (suit === Suit.CASH) {
                if (isBigFourCash(sVal) && isBigFourCash(pVal)) { score = 5; desc = "十字互冲 (5分)"; }
            } else {
                const sRank = card.rank;
                const pRank = potCard.rank;
                if ((sRank === CardRank.ZUN || sRank === CardRank.JI) && pRank === CardRank.JIAN) { score = 2; desc = "冲肩 (2分)"; }
                else if (sRank === CardRank.JIAN && (pRank === CardRank.ZUN || pRank === CardRank.JI)) {
                    if (pRank === CardRank.ZUN) { score = 3; desc = "肩冲赏 (3分)"; }
                    else if (pRank === CardRank.JI) { score = 2; desc = "肩冲极 (2分)"; }
                }
                else if (sRank === CardRank.ZUN && pRank === CardRank.JI) { score = 3; desc = "赏冲极 (3分)"; }
                else if (sRank === CardRank.JI && pRank === CardRank.ZUN) { score = 3; desc = "极冲赏 (3分)"; }
            }
        }
        // 2. Jin vs Qing
        else if (isJinZhang(card) && !isJinZhang(potCard)) {
            const isRestricted = isRestrictedQing(pVal, suit);
            let canMatch = true;
            if (isRestricted && !hasRoot(pVal, suit, uSet)) canMatch = false;

            if (canMatch) {
                if (checkConnectivity(sVal, pVal, suit, uSet)) {
                    score = 2; desc = "完整连续 (2分)";
                } else {
                    score = 0; 
                }
            }
        }
        // 3. Qing vs Jin
        else if (!isJinZhang(card) && isJinZhang(potCard)) {
             if (suit === Suit.CASH && sVal === 8) { // 90 vs Big
                 if (uSet.has(9)) { score = 3; desc = "九十冲百 (3分)"; }
             }
        }
        // 4. Qing vs Qing
        else {
            if (checkConnectivity(sVal, pVal, suit, uSet)) {
                let isValidSequence = true;
                const maxVal = Math.max(sVal, pVal);
                const minVal = Math.min(sVal, pVal);
                
                if (isRestrictedQing(sVal, suit) || isRestrictedQing(pVal, suit)) {
                     if (suit === Suit.CASH) {
                         const connectsTo90 = checkConnectivity(maxVal, 8, suit, uSet);
                         const connectsTo30 = checkConnectivity(minVal, 2, suit, uSet);
                         if (!connectsTo90 && !connectsTo30) isValidSequence = false;
                     } else {
                         if (!hasRoot(maxVal, suit, uSet) && !hasRoot(minVal, suit, uSet)) isValidSequence = false;
                     }
                }
                if (isValidSequence) { score = 2; desc = "顺领 (2分)"; }
            }
        }

        if (suit === Suit.COINS && ((sVal === 9 && pVal === 3) || (sVal === 3 && pVal === 9))) {
             if (!uSet.has(1) && !uSet.has(2)) score = 0; 
        }

        if (score > 0) {
            const finalScore = score * multiplier;
            totalScore += finalScore;
            validCards.push(card);
            
            let finalDesc = desc;
            if (multiplier > 1) finalDesc += ` [x${multiplier}]`;
            descriptions.push(finalDesc);
            
            const dist = Math.abs(sVal - pVal);
            if (dist < minLinearDistance) minLinearDistance = dist;
        }
    }

    if (totalScore === 0) return null;

    let matchType: KaiChongScoreResult['matchType'] = 'DAN_CHONG';
    if (validCards.length >= 3) matchType = 'SHUN_LING';
    else if (validCards.length === 2) matchType = 'BROTHER';

    // RULE: Single Match (Dan Chong) Restrictions
    // A single Qing card cannot Kai Chong.
    // Exception: 90 Wan (Value 8) is considered a Shoulder (Jin Zhang equivalent) in Cash suit.
    if (matchType === 'DAN_CHONG') {
        const sourceCard = validCards[0];
        const isSpecial90 = sourceCard.id === ID_90_WAN;
        
        // If source is NOT Jin Zhang AND NOT 90 Wan, it cannot be a Single Match.
        if (!isJinZhang(sourceCard) && !isSpecial90) {
            return null;
        }
    }

    const uniqueDescs = Array.from(new Set(descriptions));
    return {
        score: totalScore,
        matchType,
        description: `${getLabel(matchType)}: ${uniqueDescs.join(', ')}`,
        validCards,
        priority: minLinearDistance 
    };
};

const getLabel = (type: string) => {
    const map: Record<string, string> = {
        'SHUN_LING': '顺领',
        'BROTHER': '兄弟',
        'DAN_CHONG': '单冲',
        'JIAN_LING': '间领',
        'OTHER': '开冲'
    };
    return map[type] || type;
};
