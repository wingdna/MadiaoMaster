
import { Card, Player, Suit, CardRank, CardColor } from '../types';
import { PenaltyType } from './ruleDefinitions';
import { ID_QIAN_WAN, ID_WAN_WAN, ID_BAI_WAN, ID_20_WAN } from '../constants';

export const detectDiscardRules = (
  player: Player,
  cardToPlay: Card,
  tableCards: { card: Card }[]
): PenaltyType | null => {
    // Basic check: Only applies when DISCARDING (Melting), i.e., not following suit
    if (tableCards.length === 0) return null; // Leading is not discarding
    const leadSuit = tableCards[0].card.suit;
    if (cardToPlay.suit === leadSuit) return null; // Following suit is mandatory

    const hand = player.hand;
    const otherOptions = hand.filter(c => c.id !== cardToPlay.id);

    // 1. Mie Qian / Mie Wan
    // Check by VALUE to catch Substitutes (e.g. 90 Wan transformed into Wan Wan)
    const isQianWan = cardToPlay.suit === Suit.CASH && cardToPlay.value === 10;
    const isWanWan = cardToPlay.suit === Suit.CASH && cardToPlay.value === 11;

    if (isQianWan && otherOptions.length > 0) {
        return PenaltyType.MIE_QIAN;
    }
    if (isWanWan && otherOptions.length > 0) {
        return PenaltyType.MIE_WAN;
    }

    // 2. Wan Qian Bai Xia Mie Shi (Discarding Cash when High Cards are played)
    const hasHighCardOnTable = tableCards.some(tc => 
        tc.card.suit === Suit.CASH && tc.card.value >= 9 // 9=Bai, 10=Qian, 11=Wan
    );

    if (hasHighCardOnTable && cardToPlay.suit === Suit.CASH) {
        // You are discarding Cash while a High Card is on table.
        if (otherOptions.length > 0) {
             return PenaltyType.WAN_QIAN_BAI_XIA_MIE_SHI;
        }
    }

    // 3. Mie Pai Ci Xu (Priority: Ten > Three > Extreme)
    // Rule: If you hold Cash (Shi) but discard Extreme (Ji), warning.
    const holdsCash = otherOptions.some(c => c.suit === Suit.CASH && c.rank === CardRank.QING);
    if (holdsCash && cardToPlay.suit !== Suit.CASH && cardToPlay.rank === CardRank.JI) {
        return PenaltyType.MIE_PAI_CI_XU;
    }

    // 4. Mie Shu Liu Sheng
    // Heuristic: Discarding from a single-card suit while holding multiple cards of another suit.
    const suitCounts: Record<string, number> = {};
    hand.forEach(c => { suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1; });
    
    if (suitCounts[cardToPlay.suit] === 1 && Object.keys(suitCounts).length === 4) {
        const safeSuits = Object.entries(suitCounts).filter(([k, v]) => v > 1 && k !== cardToPlay.suit);
        if (safeSuits.length > 0) {
            return PenaltyType.MIE_SHU_LIU_SHENG;
        }
    }

    return null;
};
