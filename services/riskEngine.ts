
import { Player, Card, Suit, CardRank, CardColor, RiskLevel, TacticalPriority, RiskAssessment, SuitStatus } from '../types';
import { 
    ID_WAN_WAN, ID_QIAN_WAN, ID_BAI_WAN, ID_20_WAN, ID_90_WAN
} from '../constants';
import { PenaltyType } from './ruleDefinitions';

// --- HELPERS ---

const isRed = (card: Card) => card.color === CardColor.RED;
const isGreen = (card: Card) => card.color === CardColor.GREEN;
const isCash = (card: Card) => card.suit === Suit.CASH;

const isZhenZhang = (
    card: Card, 
    hand: Card[], 
    recordedCards: Card[], 
    tableCards: { card: Card }[], 
    mianZhangCard: Card | null
): boolean => {
    const W = new Set<string>();
    
    hand.forEach(c => W.add(c.id));
    recordedCards.forEach(c => W.add(c.id));
    tableCards.forEach(tc => W.add(tc.card.id));

    if (mianZhangCard) {
        const isQing = mianZhangCard.rank === CardRank.QING;
        const is90Wan = mianZhangCard.id === ID_90_WAN;
        if (isQing && !is90Wan) {
            W.add(mianZhangCard.id);
        }
    }

    const maxVal = (card.suit === Suit.CASH || card.suit === Suit.TEXTS) ? 11 : 9;

    for (let v = card.value + 1; v <= maxVal; v++) {
        const higherCardInW = 
            hand.some(c => c.suit === card.suit && c.value === v) ||
            recordedCards.some(c => c.suit === card.suit && c.value === v) ||
            tableCards.some(tc => tc.card.suit === card.suit && tc.card.value === v) ||
            (mianZhangCard && mianZhangCard.suit === card.suit && mianZhangCard.value === v && mianZhangCard.rank === CardRank.QING && mianZhangCard.id !== ID_90_WAN);

        if (!higherCardInW) {
            return false;
        }
    }
    return true;
};

const isDaZhang = (card: Card): boolean => {
    if (card.suit === Suit.TEXTS) return card.value >= 7;
    return card.value >= 6;
};

const getSequenceWinners = (hand: Card[], winningCard: Card, recordedCards: Card[]): Card[] => {
    return hand.filter(c => c.suit === winningCard.suit && c.value > winningCard.value);
};

// --- RULE IMPLEMENTATIONS ---

// 1. 不立赏 (Bu Li Shang)
const checkBuLiShang = (player: Player, card: Card): RiskAssessment | null => {
    const tricksWon = player.capturedCards ? player.capturedCards.length : 0;
    if (tricksWon > 0) return null;

    const hand = player.hand;
    const hasWan = hand.some(c => c.id === ID_WAN_WAN);
    const hasQian = hand.some(c => c.id === ID_QIAN_WAN);
    const hasBai = hand.some(c => c.id === ID_BAI_WAN);

    if (hasWan && hasQian && hasBai) {
        if (hand.length > 1 && card.id === ID_QIAN_WAN) {
             return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.TI_JIN_QIAN_WANG, message: '提尽千王：三公在手，手牌>1时不能发千万！', tacticalContext: TacticalPriority.ANTI_BANKER };
        }
    }

    if (hasWan && hasQian && !hasBai) {
        if (card.id === ID_QIAN_WAN) {
            return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.DAO_LI_QIAN_HONG, message: '倒立千红：有万无百，首发千万，以急桌论处！', tacticalContext: TacticalPriority.ANTI_BANKER };
        }
        if (card.id !== ID_WAN_WAN) {
            return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.BU_LI_WAN, message: '不立万：有万无百，必须首发万万！', tacticalContext: TacticalPriority.ANTI_BANKER };
        }
        return null;
    }

    const suits = [Suit.CASH, Suit.STRINGS, Suit.COINS, Suit.TEXTS];
    for (const suit of suits) {
        const suitCards = hand.filter(c => c.suit === suit);
        const shang = suitCards.find(c => c.rank === CardRank.ZUN);
        const jian = suitCards.find(c => c.rank === CardRank.JIAN);

        if (shang && jian) {
            const isPlayingShangOrJian = (card.id === shang.id || card.id === jian.id);
            const isPlayingSequence = suitCards.some(c => c.id === card.id && (Math.abs(c.value - shang.value) === 1 || Math.abs(c.value - jian.value) === 1));
            
            if (card.suit !== suit) {
                 return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.BU_LI_SHANG, message: '不立赏：持有同门赏肩，必须优先打出该门！', tacticalContext: TacticalPriority.ANTI_BANKER };
            }
            
            if (!isPlayingShangOrJian && !isPlayingSequence) {
                 return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.BU_LI_SHANG, message: '不立赏：必须打出赏、肩或其同花顺！', tacticalContext: TacticalPriority.ANTI_BANKER };
            }
        }
    }

    return null;
};

// 2. 不报百 (Bu Bao Bai)
const checkBuBaoBai = (
    player: Player, 
    card: Card, 
    openedSuits: { suit: Suit, leaderId: number, isBanker: boolean }[]
): RiskAssessment | null => {
    if (player.isDealer) return null;
    
    const hand = player.hand;
    const hasBai = hand.some(c => c.id === ID_BAI_WAN);
    if (!hasBai) return null;

    const openedNonCash = openedSuits.filter(s => s.suit !== Suit.CASH);
    const hasShuMen = openedNonCash.length > 0;
    
    if (!hasShuMen) return null;

    const bankerLed = openedSuits.some(s => s.isBanker);
    if (bankerLed && card.suit === Suit.CASH) {
        return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.WO_DI_BAI_LAO, message: '卧底百老：庄家已首发过，百老不可发十字门！', tacticalContext: TacticalPriority.ANTI_BAI_LAO };
    }

    const uniqueSuits = new Set(openedNonCash.map(s => s.suit));
    if (uniqueSuits.size >= 2 && card.suit === Suit.CASH) {
        return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.WO_DI_BAI_LAO, message: '卧底百老：两门熟门已定，百老不可发十字门！', tacticalContext: TacticalPriority.ANTI_BAI_LAO };
    }

    const hasShang = hand.some(c => c.rank === CardRank.ZUN);
    if (!hasShang && card.suit === Suit.CASH) {
        return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.WU_SHANG_BAO_BAI, message: '无赏报百：无赏不可发十字门！', tacticalContext: TacticalPriority.ANTI_BAI_LAO };
    }

    if (!bankerLed && uniqueSuits.size < 2 && hasShang) {
        if (card.suit !== Suit.CASH) {
            return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.BU_BAO_BAI, message: '不报百：符合条件必须首发十字门！', tacticalContext: TacticalPriority.ANTI_BAI_LAO };
        }
    }

    return null;
};

// 3. 禁门次序 (Jin Men Ci Xu)
const checkJinMenCiXu = (
    player: Player, 
    card: Card, 
    openedSuits: { suit: Suit, leaderId: number, isBanker: boolean }[]
): RiskAssessment | null => {
    if (player.isDealer) return null;

    const hand = player.hand;
    // Definition Fix: 
    // Jin Men (Forbidden/Raw) = Suits NOT in openedSuits (excluding Cash).
    // Shu Men (Familiar/Cooked) = Suits IN openedSuits.
    // If I hold cards from a Jin Men (Unopened Non-Cash), I should play them (Open the door) before playing Cash (unless I'm Bai Lao).
    
    const openedNonCashSuits = new Set(openedSuits.filter(s => s.suit !== Suit.CASH).map(s => s.suit));
    const jinMenCards = hand.filter(c => c.suit !== Suit.CASH && !openedNonCashSuits.has(c.suit));
    
    const hasBai = hand.some(c => c.id === ID_BAI_WAN);
    const hasWan = hand.some(c => c.id === ID_WAN_WAN);
    const hasQian = hand.some(c => c.id === ID_QIAN_WAN);
    
    const bankerLedWan = openedSuits.some(s => s.suit === Suit.CASH && s.isBanker); 

    // --- CONFLICT RESOLUTION: Bu Li Wan Priority ---
    // Rule: If holding Wan Wan & Qian Wan (but no Bai Wan), the player MUST lead Wan Wan.
    // This obligation overrides the "Jin Men" (Open Door) restriction.
    if (hasWan && hasQian && !hasBai) {
        // If the player is doing the right thing (Leading Wan Wan), do not flag Jin Men violation.
        if (card.id === ID_WAN_WAN) {
            return null;
        }
    }
    // -----------------------------------------------

    // Obligation 1: Qian Seng Wo Di
    if (!bankerLedWan && !hasWan && !hasQian) {
        if (hasBai) {
            const bigQing = hand.some(c => c.suit === Suit.CASH && c.rank === CardRank.QING && c.value > 4); 
            if (bigQing && card.id !== ID_BAI_WAN) {
                 return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.QIAN_SENG_WO_DI, message: '千僧卧底：无千万万万，有百及大青，应先发百万！', tacticalContext: TacticalPriority.ANTI_BANKER };
            }
        }
    }

    // Obligation 2: San Men Priority (Open Unopened Suits)
    if (jinMenCards.length > 0) {
        if (card.suit === Suit.CASH) {
             // You have cards in a suit that hasn't been opened yet. Prioritize opening them over playing Cash.
             // This assumes player is NOT Bai Lao (handled by Bu Bao Bai checks) or logic falls through.
             // If player IS Bai Lao, checkBuBaoBai might force Cash, which takes precedence. 
             // But if BuBaoBai didn't trigger (e.g. no Shu Men yet), then Jin Men priority holds.
             return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.JIN_MEN_CI_XU, message: '禁门次序：应先发三门（未开门/生门），不可发十字门！', tacticalContext: TacticalPriority.ANTI_BANKER };
        }
    }

    return null;
};

// 4. 违规提万 & 5. 提尽千王 & 6. 闯千
const checkCashLeadingRules = (
    player: Player,
    card: Card,
    openedSuits: { suit: Suit, leaderId: number, isBanker: boolean }[]
): RiskAssessment | null => {
    if (player.isDealer) return null;
    const hand = player.hand;
    const n = hand.length;

    const hasWan = hand.some(c => c.id === ID_WAN_WAN);
    const hasQian = hand.some(c => c.id === ID_QIAN_WAN);
    const hasBai = hand.some(c => c.id === ID_BAI_WAN);

    const isRedWan = [ID_WAN_WAN, ID_QIAN_WAN, ID_BAI_WAN].includes(card.id);
    if (isRedWan && n === 4) {
         return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.WU_ZHUO_TI_WAN, message: '五桌提万：剩4张牌时不可提万！', tacticalContext: TacticalPriority.ANTI_BANKER };
    }

    const playerLedCash = openedSuits.some(s => s.suit === Suit.CASH && s.leaderId === player.id);

    if (hasWan && hasQian) {
        if (n > 1) {
            if (hasBai && card.id === ID_WAN_WAN) return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.TI_JIN_QIAN_WANG, message: '提尽千王：三公在手首发万万！', tacticalContext: TacticalPriority.ANTI_BANKER };
            
            if (!hasBai) {
                if (playerLedCash && card.id === ID_QIAN_WAN) return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.TI_JIN_QIAN_WANG, message: '提尽千王：曾首发万，今发千，违例！', tacticalContext: TacticalPriority.ANTI_BANKER };
                if (!playerLedCash && card.id === ID_QIAN_WAN) return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.DAO_LI_QIAN_HONG, message: '倒立千红：未发万先发千！', tacticalContext: TacticalPriority.ANTI_BANKER };
            }
        }
    }

    if (hasQian && !hasBai) {
        if (n > 1) {
            if (!hasWan && card.id === ID_QIAN_WAN) return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.CHUANG_QIAN, message: '闯千：单千无百，首发千违例！', tacticalContext: TacticalPriority.ANTI_BANKER };
            
            if (hasWan && card.id === ID_QIAN_WAN) {
                if (playerLedCash) return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.CHUANG_QIAN, message: '闯千：有万无百，再次发千违例！', tacticalContext: TacticalPriority.ANTI_BANKER };
            }
        }
    }

    return null;
};


// REFACTORED PRIORITY ONE (Follow Logic: Qin Wang & Others)
const checkPriorityOne = (
    player: Player,
    card: Card,
    winningCard: Card,
    winningPlayerId: number,
    tableCards: { card: Card, playerId: number }[],
    bankerId: number,
    recordedCards: Card[],
    firstLeadInfo: { card: Card, playerId: number } | null,
    mianZhangCard: Card | null
): RiskAssessment | null => {
    const isBanker = player.id === bankerId;
    const hand = player.hand;

    if (!isBanker && tableCards.length > 0) {
        const winners = hand.filter(c => c.suit === winningCard.suit && c.value > winningCard.value).sort((a,b) => b.value - a.value); 
        const canWin = winners.length > 0;
        
        const isXCash = winningCard.suit === Suit.CASH;

        const capturedCount = player.capturedCards ? player.capturedCards.length : 0;
        const holdsWanOrQian = hand.some(c => c.id === ID_WAN_WAN || c.id === ID_QIAN_WAN);
        const nonCashShangCount = hand.filter(c => c.suit !== Suit.CASH && c.rank === CardRank.ZUN).length;
        
        const isQinWangEligible = !isXCash && capturedCount === 0 && holdsWanOrQian && nonCashShangCount < 2;

        const bankerPlayed = tableCards.some(tc => tc.playerId === bankerId);

        if (canWin) {
            const isCapturing = card.suit === winningCard.suit && card.value > winningCard.value;

            if (!bankerPlayed) {
                if (isQinWangEligible) {
                    const isTrue = isZhenZhang(card, hand, recordedCards, tableCards, mianZhangCard);
                    const isMax = card.id === winners[0].id;
                    const sequenceWinners = getSequenceWinners(hand, winningCard, recordedCards);
                    const isSeq = sequenceWinners.some(c => c.id === card.id);

                    if (isCapturing) {
                        if (!isTrue && !isMax && !isSeq) {
                            return null; // Valid Qin Wang
                        }
                        return null; 
                    } else {
                        return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.LOU_ZHUANG, message: '漏庄：勤王时刻，你有赢牌却未捉打！', tacticalContext: TacticalPriority.ANTI_BANKER };
                    }
                } else {
                    if (!isCapturing) {
                         const isTrue = isZhenZhang(card, hand, recordedCards, tableCards, mianZhangCard);
                         const isMax = card.id === winners[0].id;
                         if (isTrue || isMax) {
                             return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.LOU_ZHUANG_FAIL, message: '漏庄：持有真张或大牌必须捉打！', tacticalContext: TacticalPriority.ANTI_BANKER };
                         }
                    }
                }
            }
            else {
                const winnerIsPeasant = winningPlayerId !== bankerId;
                if (winnerIsPeasant) {
                    if (isCapturing) {
                        // EXCEPTION: Cash High Card Battle (Wan/Qian vs Bai/Qian) is allowed
                        // User Request: When table has Bai(9) or Qian(10), playing Qian(10) or Wan(11) is legal.
                        if (winningCard.suit === Suit.CASH && card.suit === Suit.CASH) {
                            const winningIsBig = winningCard.value === 9 || winningCard.value === 10; // Bai or Qian
                            const playingIsBig = card.value === 10 || card.value === 11; // Qian or Wan
                            if (winningIsBig && playingIsBig) {
                                return null; // Safe, no Ji Zhuo check
                            }
                        }

                        // FIX: 纵趣优先。如果必捉趣张（Zong Qu），则不视为急捉。
                        if (!isGreen(winningCard)) {
                            return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.JI_ZHUO, message: '急捉：庄家已出牌，同伙赢牌中，不可捉打！', tacticalContext: TacticalPriority.ANTI_SE_YANG };
                        }
                    }
                }
            }
        }
    }

    return null;
};

const checkPriorityZero = (player: Player, card: Card, winningCard: Card, winningPlayerId: number, tableCards: any[]) => {
    if (isGreen(winningCard) && player.hand.some(c => c.suit === winningCard.suit && c.value > winningCard.value)) {
        if (!(card.suit === winningCard.suit && card.value > winningCard.value)) {
             return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.ZONG_QU_GAME, message: '纵趣：趣张称霸，必须捉打！', tacticalContext: TacticalPriority.ANTI_SE_YANG };
        }
    }
    if (winningCard.id === ID_QIAN_WAN && player.hand.some(c => c.id === ID_WAN_WAN)) {
        if (card.id !== ID_WAN_WAN) {
             return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.FANG_GONG_QIAN, message: '放功千：必须用万万捉千万！', tacticalContext: TacticalPriority.ANTI_BANKER };
        }
    }
    return null;
};

// --- MAIN EXPORT ---

export const evaluatePlayRisk = (
    player: Player,
    card: Card,
    tableCards: { card: Card, playerId: number }[],
    bankerId: number,
    allPlayers: Player[],
    recordedCards: Card[],
    openedSuits: { suit: Suit, leaderId: number, isBanker: boolean }[] = [],
    firstLeadInfo: { card: Card, playerId: number } | null = null,
    roundNumber: number = 1,
    mianZhangCard: Card | null = null,
    bankerFirstLeadCard: Card | null = null // Updated signature
): RiskAssessment | null => {
    if (tableCards.length === 0) {
        const buLiShang = checkBuLiShang(player, card);
        if (buLiShang) return buLiShang;

        const buBaoBai = checkBuBaoBai(player, card, openedSuits);
        if (buBaoBai) return buBaoBai;

        const jinMen = checkJinMenCiXu(player, card, openedSuits);
        if (jinMen) return jinMen;

        const cashRules = checkCashLeadingRules(player, card, openedSuits);
        if (cashRules) return cashRules;

        if (card.id === ID_QIAN_WAN && player.hand.length === 8 && !player.isDealer) { 
             return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.LEAD_QIAN_WAN, message: '首发千万是禁手。', tacticalContext: TacticalPriority.ANTI_BANKER };
        }
        return null;
    }

    const leadSuit = tableCards[0].card.suit;
    let winningCard = tableCards[0].card;
    let winningPlayerId = tableCards[0].playerId;
    let currentBest = winningCard.value;

    tableCards.forEach(tc => {
        if (tc.card.suit === leadSuit && tc.card.value > currentBest) {
            currentBest = tc.card.value;
            winningCard = tc.card;
            winningPlayerId = tc.playerId;
        }
    });

    const p0 = checkPriorityZero(player, card, winningCard, winningPlayerId, tableCards);
    if (p0) return p0;

    const p1 = checkPriorityOne(player, card, winningCard, winningPlayerId, tableCards, bankerId, recordedCards, firstLeadInfo, mianZhangCard);
    if (p1) return p1;

    const canWin = player.hand.some(c => c.suit === winningCard.suit && c.value > winningCard.value);
    if (canWin && winningPlayerId === bankerId && !player.isDealer) {
        const isCapturing = card.suit === winningCard.suit && card.value > winningCard.value;
        if (!isCapturing) {
             if (isDaZhang(winningCard) || tableCards.length === 3) {
                 return { riskLevel: RiskLevel.PENALTY, ruleId: PenaltyType.ZONG_ZHUANG, message: '纵庄：庄家大牌必须捉！', tacticalContext: TacticalPriority.ANTI_BANKER };
             }
        }
    }

    return { riskLevel: RiskLevel.SAFE, ruleId: 'SAFE', message: '安全', tacticalContext: TacticalPriority.ANTI_BANKER };
};

export const getSuitStatusContext = (
    player: Player, 
    card: Card, 
    bankerId: number, 
    openedSuits: { suit: Suit, leaderId: number, isBanker: boolean }[], 
    recordedCards: Card[], 
    firstLeadInfo: any, 
    faceUpCardIds: Set<string>,
    bankerFirstLeadCard: Card | null
): SuitStatus => {
    
    // 1. CASH LOGIC
    if (card.suit === Suit.CASH) {
        // Global Unlock: Wan, Qian, Bai all face up
        const allBigThreeUp = faceUpCardIds.has(ID_WAN_WAN) && faceUpCardIds.has(ID_QIAN_WAN) && faceUpCardIds.has(ID_BAI_WAN);
        if (allBigThreeUp) return 'SAFE'; // Shu Men

        const hasBai = player.hand.some(c => c.id === ID_BAI_WAN);
        if (player.isDealer) {
            return hasBai ? 'SAFE' : 'FORBIDDEN';
        } else {
            // Peasant with Bai Wan
            if (hasBai) {
                // Check if Banker's FIRST lead was NOT Wan Wan
                // If banker hasn't led yet, or led Wan Wan, it's Forbidden.
                // If banker led something else first, it's Familiar.
                if (bankerFirstLeadCard && bankerFirstLeadCard.id !== ID_WAN_WAN) {
                    return 'SAFE';
                }
            }
            // Normal Peasant or Bai Lao (before conditions met)
            return 'FORBIDDEN';
        }
    }

    // 2. NON-CASH LOGIC
    // Logic: Identify if this suit is currently Forbidden (Jin Men)
    
    // Analyze Opened Suits history to find Familiar/Forbidden assignment
    const nonCashOpened = openedSuits.filter(s => s.suit !== Suit.CASH);
    
    // Collect distinct suits led by peasants
    const peasantLedSuits = new Set<Suit>();
    nonCashOpened.forEach(s => {
        if (!s.isBanker) peasantLedSuits.add(s.suit);
    });

    let forbiddenSuit: Suit | null = null;
    let isLocked = false;

    // Check Banker's Trigger
    // Find the first Non-Cash suit led by Banker
    const bankerLeadEntry = nonCashOpened.find(s => s.isBanker);
    
    if (bankerLeadEntry) {
        // Did the banker lead this BEFORE 2 peasant suits were established?
        // We iterate to see order.
        let pCount = 0;
        for (const s of nonCashOpened) {
            if (s.suit === bankerLeadEntry.suit && s.isBanker) {
                // Found Banker's lead.
                if (pCount < 2) {
                    // Banker led before 2 peasant suits established.
                    // This suit becomes Forbidden.
                    forbiddenSuit = s.suit;
                    isLocked = true;
                }
                break;
            }
            if (!s.isBanker) {
                // It's a peasant lead. Note: strictly distinct count needed?
                // The rules imply "First and Second suits led by peasants".
                // We simplify: If we see Banker lead, check unique peasant suits before it.
            }
            // Re-eval: let's do it properly by index.
        }
    }

    if (!isLocked) {
        // If Banker didn't trigger early forbidden, check if Peasants established 2.
        const pSuits = Array.from(peasantLedSuits);
        if (pSuits.length >= 2) {
            // First 2 are Familiar. The 3rd (if exists) is Forbidden.
            // Which is the 3rd? The one NOT in the first 2.
            const allNonCash = [Suit.STRINGS, Suit.COINS, Suit.TEXTS];
            const familiar = new Set([pSuits[0], pSuits[1]]);
            const remaining = allNonCash.find(s => !familiar.has(s));
            if (remaining) forbiddenSuit = remaining;
        }
    }

    // Default for non-Cash is Familiar (Safe), unless identified as Forbidden
    if (forbiddenSuit && card.suit === forbiddenSuit) {
        return 'FORBIDDEN';
    }

    return 'SAFE'; // Shu Men
};

export const getPriorityDiscardCards = (
    player: Player, 
    tableCards: { card: Card, playerId: number }[], 
    recordedCards: Card[], 
    openedSuits: { suit: Suit, leaderId: number, isBanker: boolean }[], 
    bankerId: number, 
    firstLeadInfo: { card: Card, playerId: number } | null
) => {
    return player.hand;
};

export const getCaptureRequirement = (
    player: Player, 
    tableCards: { card: Card, playerId: number }[], 
    bankerId: number
) => {
    return { isForced: false, winningCards: [] };
};
