
import { useMemo } from 'react';
import { Player, GamePhase, Card } from '../types';
import { getPriorityDiscardCards, getCaptureRequirement } from '../services/riskEngine';

interface GameState {
    players: Player[];
    phase: GamePhase;
    trickNumber: number;
    currentPlayerIndex: number;
    tableCards: { card: Card, playerId: number }[];
    recordedCards: Card[];
    openedSuits: any[];
    bankerId: number;
    firstLeadInfo: any;
    selectedCardId: string | null;
}

interface GameSettings {
    oneClickPlay: boolean;
}

interface GameActions {
    executePlayCard: (playerId: number, cardId: string, bypassRisk?: boolean) => void;
}

export const useGameInteraction = (
    state: GameState,
    actions: GameActions,
    humanPlayer: Player | undefined,
    settings: GameSettings
) => {
    const {
        players, phase, trickNumber, currentPlayerIndex, tableCards,
        recordedCards, openedSuits, bankerId, firstLeadInfo, selectedCardId
    } = state;

    const interactionState = useMemo(() => {
        // 1. Basic Validity Checks
        if (!humanPlayer || phase !== GamePhase.PLAYING) {
            return { label: '', disabled: true, highlightedCardIds: new Set<string>() };
        }

        const isMyTurn = players[currentPlayerIndex]?.id === 0;
        // Interaction allowed if: It's my turn, NOT Bi Zhang (auto), and table isn't full
        const canInteract = isMyTurn && trickNumber !== 8 && (tableCards ? tableCards.length < 4 : true);

        let label = "出牌";
        let highlightedCardIds = new Set<string>();
        let disabled = !canInteract;

        if (trickNumber === 8) {
            disabled = true; // Bi Zhang is automatic animation
            label = "比张";
        } else if (canInteract) {
            if (!tableCards || tableCards.length === 0) {
                // Case A: Leading
                label = "发牌";
            } else {
                // Case B: Following / Capturing
                const leadSuit = tableCards[0].card.suit;
                let currentBestVal = -1;
                tableCards.forEach((tc: any) => {
                    if (tc.card.suit === leadSuit && tc.card.value > currentBestVal) currentBestVal = tc.card.value;
                });
                
                // Can I win?
                const canWin = humanPlayer.hand.some((c: Card) => c.suit === leadSuit && c.value > currentBestVal);
                label = canWin ? "捉牌" : "灭牌";

                if (label === "捉牌") {
                    // Logic: Suggest winning cards (Capture)
                    const req = getCaptureRequirement(humanPlayer, tableCards, bankerId);
                    if (req.isForced) req.winningCards.forEach((c: any) => highlightedCardIds.add(c.id));
                } else {
                    // Logic: Suggest discard cards (Melt)
                    const priorityCards = getPriorityDiscardCards(humanPlayer, tableCards, recordedCards, openedSuits, bankerId, firstLeadInfo);
                    priorityCards.forEach((c: any) => highlightedCardIds.add(c.id));
                }
            }

            // Disable button if strict selection is required and nothing selected (unless 1-click mode)
            // If 1-click mode is ON, button acts as "Auto Play / Confirm Best"
            if (!settings.oneClickPlay && !selectedCardId) {
                disabled = true;
            }
        } else {
            disabled = true; // Not my turn
            label = "等待";
        }

        return { label, disabled, highlightedCardIds };
    }, [
        players, currentPlayerIndex, phase, trickNumber, tableCards, humanPlayer,
        settings.oneClickPlay, selectedCardId, recordedCards, openedSuits, bankerId, firstLeadInfo
    ]);

    const handle3DActionClick = () => {
        if (interactionState.disabled) return;
        
        if (selectedCardId) {
            // Priority 1: Play selected card
            actions.executePlayCard(0, selectedCardId);
        } else if (settings.oneClickPlay) {
            // Priority 2: Auto-play heuristic (First highlighted or First available)
            if (interactionState.highlightedCardIds.size > 0) {
                actions.executePlayCard(0, Array.from(interactionState.highlightedCardIds)[0] as string);
            } else if (humanPlayer && humanPlayer.hand.length > 0) {
                actions.executePlayCard(0, humanPlayer.hand[0].id);
            }
        }
    };

    return {
        interactionState,
        handle3DActionClick
    };
};
