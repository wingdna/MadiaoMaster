
import { GoogleGenAI, Chat, Modality } from "@google/genai";
import { MA_DIAO_TUTOR_PROMPT } from '../constants';
import { Card, Player, Suit, Difficulty, GameHistory, RiskLevel, PlayerType } from '../types';
import { evaluatePlayRisk } from './riskEngine';
import { getAIState } from './aiLearningService';

// --- ROBUST INITIALIZATION ---
let ai: GoogleGenAI | null = null;
let globalAIFailure = false;

try {
    // Safe check for process.env.API_KEY without throwing ReferenceError
    const apiKey = (typeof process !== 'undefined' && process && process.env) ? process.env.API_KEY : null;
    
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
    } else {
        console.warn("AI Key not found. AI features disabled.");
    }
} catch (e) {
    console.warn("GoogleGenAI init failed:", e);
}

export const isAIEnabled = (): boolean => !!ai && !globalAIFailure;

// 1. AI Tutor/Chat Service
let chatSession: Chat | null = null;

export const initializeChat = async (): Promise<string> => {
  if (!ai || globalAIFailure) return "AI 功能暂时不可用。";
  
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: MA_DIAO_TUTOR_PROMPT,
      },
    });
    chatSession = chat;
    return "欢迎，年轻的学徒。我是马吊大师。关于规则、策略或惩罚，尽管问我。";
  } catch (error) {
    console.error("聊天初始化错误", error);
    return "大师正在冥想中（连接错误）。";
  }
};

export const sendMessageToTutor = async (message: string): Promise<string> => {
  if (!chatSession) await initializeChat();
  if (!chatSession) return "大师保持沉默。";

  try {
    const result = await chatSession.sendMessage({ message });
    return result.text || "无言以对。";
  } catch (error: any) {
    console.error("发送消息错误", error);
    if (error.message?.includes('429') || error.status === 429 || error.code === 429) {
        globalAIFailure = true; 
        return "思维疲惫（频率限制）。请稍后再试。";
    }
    return "网络波动，请重试。";
  }
};

// 3. AI Speech Generation (TTS)
export const generateSpeech = async (text: string, voiceName: string = 'Puck'): Promise<Uint8Array | null> => {
    if (!ai || globalAIFailure) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: { parts: [{ text }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName } }
                }
            }
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            const binaryString = atob(base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        }
    } catch (e) {
        console.error("TTS Generation Error", e);
    }
    return null;
};

// 2. AI Player Logic (Strategy Brain)
export const getAIMove = async (
  aiPlayer: Player,
  tableCards: { card: Card, playerId: number }[],
  allPlayers: Player[],
  recordedCards: Card[],
  bankerId: number,
  difficulty: Difficulty = Difficulty.MEDIUM,
  gameHistory?: GameHistory,
  openedSuits: { suit: Suit, leaderId: number, isBanker: boolean }[] = [],
  firstLeadInfo: { card: Card, playerId: number } | null = null,
  roundNumber: number = 1,
  mianZhangCard: Card | null = null // Added parameter
): Promise<Card | null> => {
  if (aiPlayer.hand.length === 0) return null;

  const estimatedRound = 8 - aiPlayer.hand.length;

  const getHeuristicMove = (): Card => {
     const hand = [...aiPlayer.hand];
     const learningState = gameHistory ? getAIState(aiPlayer.id, gameHistory) : { aggression: 0.5, riskTolerance: 0.3, bluffFrequency: 0, playerId: aiPlayer.id, gamesPlayed: 0, winRate: 0, lastRole: 'PEASANT', lastResult: 'DRAW' };
     
     // Step 1: Risk Assessment
     const analyzedMoves = hand.map(card => {
         const risk = evaluatePlayRisk(
             { ...aiPlayer, type: PlayerType.HUMAN }, // Trick engine to treat as human for risk calc
             card, 
             tableCards, 
             bankerId, 
             allPlayers, 
             recordedCards,
             openedSuits,
             firstLeadInfo,
             estimatedRound,
             mianZhangCard // Pass it down
         );
         return { card, risk };
     });

     // Step 2: Filtering based on Personality
     
     // Level 1: Absolute Prohibition (PENALTY)
     let validMoves = analyzedMoves.filter(m => !m.risk || m.risk.riskLevel !== RiskLevel.PENALTY);
     if (validMoves.length === 0) validMoves = analyzedMoves; 

     // Level 2: Risk Tolerance (WARNING)
     if (difficulty !== Difficulty.EASY) {
         if (learningState.riskTolerance < 0.5) {
             const noWarnings = validMoves.filter(m => !m.risk || m.risk.riskLevel !== RiskLevel.WARNING);
             if (noWarnings.length > 0) validMoves = noWarnings;
         }
     }

     // Level 3: Aggression (NOTICE)
     if (learningState.aggression < 0.4) {
         const purelySafe = validMoves.filter(m => !m.risk || m.risk.riskLevel === RiskLevel.SAFE);
         if (purelySafe.length > 0) validMoves = purelySafe;
     }

     const candidates = validMoves.map(m => m.card);
     
     // Step 3: Optimization
     const isBaiLao = aiPlayer.hand.some(c => c.id === 'c_9');

     const sortLowToHigh = (cards: Card[]) => [...cards].sort((a,b) => a.value - b.value);
     const sortHighToLow = (cards: Card[]) => [...cards].sort((a,b) => b.value - a.value);

     // Case A: Leading
     if (tableCards.length === 0) {
        const shouldAttack = learningState.aggression > 0.6 || aiPlayer.id === bankerId || isBaiLao;
        
        if (shouldAttack) {
            return sortHighToLow(candidates)[0];
        } else {
            return sortLowToHigh(candidates)[0];
        }
     }

     // Case B: Following Suit
     const leadSuit = tableCards[0].card.suit;
     const followCards = candidates.filter(c => c.suit === leadSuit);
     
     if (followCards.length > 0) {
         let currentBestVal = -1;
         tableCards.forEach(tc => {
            if (tc.card.suit === leadSuit && tc.card.value > currentBestVal) currentBestVal = tc.card.value;
         });

         const winningMoves = followCards.filter(c => c.value > currentBestVal);
         
         if (winningMoves.length > 0) {
             if (learningState.aggression > 0.8) {
                 return sortHighToLow(winningMoves)[0]; 
             }
             return sortLowToHigh(winningMoves)[0]; 
         } else {
             return sortLowToHigh(followCards)[0];
         }
     }

     // Case C: Discarding (Melting)
     const safeDiscards = candidates;
     
     const sortForDiscard = (cards: Card[]): Card[] => {
        return cards.sort((a, b) => {
             if (a.id === 'c_9') return 1;
             if (b.id === 'c_9') return -1;
             
             const aIsRed = a.color === 'red';
             const bIsRed = b.color === 'red';
             
             if (learningState.aggression > 0.5) {
                 if (aIsRed && !bIsRed) return 1; 
                 if (!aIsRed && bIsRed) return -1;
             }
             return a.value - b.value; 
        });
     };
     
     return sortForDiscard(safeDiscards)[0];
  };

  try {
      return getHeuristicMove();
  } catch (e) {
      console.error("AI Decision Error", e);
      return aiPlayer.hand[0]; 
  }
};
