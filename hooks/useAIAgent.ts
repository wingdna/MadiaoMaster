
import { useState, useEffect, useRef } from 'react';
import { Player, PlayerType, GamePhase, CardRank, SupportedLanguage } from '../types';
import { getAIMove, generateSpeech } from '../services/geminiService';
import { getAIChatMessage, ChatContext } from '../services/aiChatService';
import { getAIState } from '../services/aiLearningService';

interface UseAIAgentProps {
    gameState: any; // Using explicit types in real code is better, but any for decoupling speed here
    gameActions: any;
    audioSystem: any;
    isMuted: boolean;
    language: SupportedLanguage;
}

export const useAIAgent = ({ gameState, gameActions, audioSystem, isMuted, language }: UseAIAgentProps) => {
    const [aiChatMessages, setAiChatMessages] = useState<Record<number, string | null>>({});
    const processingRef = useRef(false);

    const { 
        players, currentPlayerIndex, phase, trickNumber, tableCards, 
        recordedCards, bankerId, difficulty, gameHistory, openedSuits, 
        firstLeadInfo, mianZhangCard, lastGameEvent, trickWinnerId
    } = gameState;

    // 1. AI MOVEMENT LOGIC
    useEffect(() => {
        const currentPlayer = players[currentPlayerIndex];
        
        // Conditions for AI to move
        const shouldMove = 
            phase === GamePhase.PLAYING && 
            trickNumber < 8 && 
            currentPlayer?.type === PlayerType.AI && 
            tableCards.length < 4 && 
            !trickWinnerId &&
            !processingRef.current;

        if (shouldMove) {
            processingRef.current = true;
            const timer = setTimeout(async () => {
                const aiPlayer = currentPlayer;
                const tableCardsForAI = tableCards.map((t: any) => ({card: t.card, playerId: t.playerId}));
                
                try {
                    const move = await getAIMove(
                        aiPlayer, tableCardsForAI, players, recordedCards, bankerId, 
                        difficulty, gameHistory, openedSuits, firstLeadInfo, trickNumber, mianZhangCard
                    );
                    
                    if (move) { 
                        // Trigger speech for special moves
                        if (move.rank === CardRank.ZUN || move.rank === CardRank.BAI) {
                            triggerAIChat(aiPlayer.id, 'PLAY_HIGH_CARD');
                        }
                        await gameActions.executePlayCard(aiPlayer.id, move.id); 
                    }
                } catch (e) {
                    console.error("AI Move Error", e);
                } finally {
                    processingRef.current = false;
                }
            }, 1000 + Math.random() * 500); // Natural delay
            return () => clearTimeout(timer);
        }
    }, [currentPlayerIndex, phase, tableCards.length, trickWinnerId, trickNumber]);

    // 2. AI REACTION LOGIC (Chat & Voice)
    // Listens to the Event Stream from the Game Engine
    useEffect(() => {
        if (!lastGameEvent) return;

        const handleEvent = async () => {
            const { type, playerId, context } = lastGameEvent;
            
            // Filter: Only AI players talk (usually)
            const player = players.find((p: Player) => p.id === playerId);
            
            // Reaction Logic
            if (type === 'TRICK_WIN') {
                // Winner talks
                if (player?.type === PlayerType.AI) {
                    triggerAIChat(playerId, context?.isBig ? 'TRICK_WIN_BIG' : 'TRICK_WIN');
                }
                // Losers lament (random chance)
                players.forEach((p: Player) => {
                    if (p.id !== playerId && p.type === PlayerType.AI && Math.random() > 0.7) {
                        triggerAIChat(p.id, 'TRICK_LOSS');
                    }
                });
            } else if (type === 'VIOLATION') {
                // A teacher AI scolds the human
                const teacherId = players.find((p: Player) => p.type === PlayerType.AI)?.id || 1;
                triggerAIChat(teacherId, 'TEACH_VIOLATION');
            } else if (type === 'KAI_CHONG_SUCCESS') {
                if (player?.type === PlayerType.AI) triggerAIChat(playerId, 'KAI_CHONG_SUCCESS');
            } else if (type === 'KAI_CHONG_FAIL') {
                if (player?.type === PlayerType.AI) triggerAIChat(playerId, 'KAI_CHONG_FAIL');
            } else if (type === 'ROUND_END') {
                // handled in scoring usually, but can be here
            }
        };

        handleEvent();

    }, [lastGameEvent]);

    const triggerAIChat = async (playerId: number, context: ChatContext) => {
        const player = players.find((p: Player) => p.id === playerId);
        if (!player) return;

        const learningState = getAIState(playerId, gameHistory || {});
        const message = getAIChatMessage(context, language, learningState);
        
        if (message) {
            // Visual Chat Bubble
            setAiChatMessages(prev => ({ ...prev, [playerId]: message }));
            setTimeout(() => { setAiChatMessages(prev => ({ ...prev, [playerId]: null })); }, 4000);
            
            // Audio TTS
            if (!isMuted) {
                let voice = 'Puck';
                if (playerId === 2) voice = 'Kore';
                if (playerId === 3) voice = 'Fenrir';
                const pcmData = await generateSpeech(message, voice);
                if (pcmData) audioSystem.playPcmAudio(pcmData);
            }
        }
    };

    return {
        aiChatMessages
    };
};
