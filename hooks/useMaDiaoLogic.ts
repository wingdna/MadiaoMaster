
import { useState, useEffect } from 'react';
import { 
    generateDeck, 
    ID_WAN_WAN, ID_QIAN_WAN, ID_BAI_WAN, 
} from '../constants';
import { Player, PlayerType, GamePhase, Card, Suit, ScoreResult, Difficulty, KaiChongDetail, CardRank, GameHistory, ViolationRecord, RiskAssessment, RiskLevel, SpecialCaptureFlags, UserProfile, SupportedLanguage } from '../types';
import { calculateRoundScores, findBestKaiChongMatch } from '../services/scoringService';
import { evaluatePlayRisk } from '../services/riskEngine';
import { loadGameStats, saveGameStats } from '../services/statsService';
import { updateAILearning, getAIState } from '../services/aiLearningService';
import { MOCK_PLAYERS } from '../services/cloudService'; 

// Utility
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const sortHand = (cards: Card[]): Card[] => {
    const getSuitWeight = (suit: Suit) => {
        switch (suit) {
            case Suit.CASH: return 4;
            case Suit.STRINGS: return 3;
            case Suit.COINS: return 2;
            case Suit.TEXTS: return 1;
            default: return 0;
        }
    };
    return [...cards].sort((a, b) => {
        const weightA = getSuitWeight(a.suit);
        const weightB = getSuitWeight(b.suit);
        if (weightA !== weightB) return weightB - weightA;
        return b.value - a.value;
    });
};

const generateEntertainingDeck = (): Card[] => {
    const fullDeck = generateDeck();
    return shuffle(fullDeck);
};

export type GameEvent = {
    type: 'GAME_START' | 'TRICK_WIN' | 'TRICK_LOSS' | 'VIOLATION' | 'ROUND_WIN' | 'ROUND_LOSS' | 'KAI_CHONG_SUCCESS' | 'KAI_CHONG_FAIL' | 'ROUND_END' | 'PENALTY';
    playerId?: number;
    context?: any;
    timestamp: number;
};

interface GameConfig {
    difficulty: Difficulty;
    isRiskAlertOn: boolean;
    language: SupportedLanguage;
}

export const useMaDiaoGame = (config: GameConfig) => {
  // --- CORE GAME STATE ONLY ---
  const [deck, setDeck] = useState<Card[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [pot, setPot] = useState<Card[]>([]);
  const [tableCards, setTableCards] = useState<{ playerId: number; card: Card; isFaceDown: boolean }[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [phase, setPhase] = useState<GamePhase>(GamePhase.DEALING);
  const [bankerId, setBankerId] = useState<number>(3);
  const [roundResults, setRoundResults] = useState<ScoreResult[]>([]);
  const [trickNumber, setTrickNumber] = useState<number>(1);
  const [gameMessage, setGameMessage] = useState<string>("");
  
  // Game Data Recording
  const [recordedCards, setRecordedCards] = useState<Card[]>([]);
  const [faceUpPlayedCardIds, setFaceUpPlayedCardIds] = useState<Set<string>>(new Set());
  const [violationLog, setViolationLog] = useState<ViolationRecord[]>([]);
  const [openedSuits, setOpenedSuits] = useState<{suit: Suit, leaderId: number, isBanker: boolean}[]>([]);
  const [firstLeadInfo, setFirstLeadInfo] = useState< {card: Card, playerId: number} | null>(null);
  const [bankerFirstLeadCard, setBankerFirstLeadCard] = useState<Card | null>(null); 
  const [gameHistory, setGameHistory] = useState<GameHistory>(() => loadGameStats());
  const [specialCaptures, setSpecialCaptures] = useState<SpecialCaptureFlags>({ wanCaughtQian: false, wanCaughtBai: false, qianCaughtBai: false });
  const [trickWinnerId, setTrickWinnerId] = useState<number | null>(null);
  const [kaiChongCardIndex, setKaiChongCardIndex] = useState<number>(0);
  const [kaiChongHistory, setKaiChongHistory] = useState<KaiChongDetail[]>([]);
  const [mianZhangCard, setMianZhangCard] = useState<Card | null>(null);
  
  // Interaction State (Selection/Risk)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [pendingRisk, setPendingRisk] = useState<{cardId: string, assessment: RiskAssessment} | null>(null);
  const [violationNotification, setViolationNotification] = useState<{title: string, message: string} | null>(null);

  // --- EVENT STREAM ---
  const [lastGameEvent, setLastGameEvent] = useState<GameEvent | null>(null);

  const emitEvent = (type: GameEvent['type'], playerId?: number, context?: any) => {
      setLastGameEvent({ type, playerId, context, timestamp: Date.now() });
  };

  // --- ACTIONS ---

  const resetRoundState = () => {
      setTableCards([]);
      setPot([]);
      setMianZhangCard(null);
      setRoundResults([]);
      setTrickNumber(1);
      setRecordedCards([]);
      setFaceUpPlayedCardIds(new Set());
      setOpenedSuits([]);
      setViolationLog([]);
      setGameMessage("");
      setKaiChongHistory([]);
      setKaiChongCardIndex(0);
      setSpecialCaptures({ wanCaughtQian: false, wanCaughtBai: false, qianCaughtBai: false });
      setSelectedCardId(null);
      setPendingRisk(null);
      setViolationNotification(null);
      setFirstLeadInfo(null);
      setBankerFirstLeadCard(null);
  };

  const startGame = (userProfile?: UserProfile, existingPlayers?: Player[]) => {
    setPhase(GamePhase.SHUFFLING);
    resetRoundState();

    setTimeout(() => {
        const newDeck = generateEntertainingDeck();
        setDeck(newDeck);
        const hands = [
            sortHand(newDeck.slice(0, 8)),
            sortHand(newDeck.slice(8, 16)),
            sortHand(newDeck.slice(16, 24)),
            sortHand(newDeck.slice(24, 32))
        ];
        // MARK POT CARDS WITH isPot: true
        const potCards = newDeck.slice(32, 39).map(c => ({ ...c, isPot: true })); 
        const mianZhang = { ...newDeck[39], isPot: true };
        
        let newPlayers: Player[] = [];
        let newBankerId = 0;

        if (existingPlayers && existingPlayers.length === 4) {
            newBankerId = (existingPlayers.findIndex(p => p.isDealer) + 1) % 4; // Rotate Banker
            newPlayers = existingPlayers.map((p, i) => {
                return {
                    ...p,
                    hand: hands[i],
                    trickPile: [],
                    capturedCards: [],
                    isDealer: p.id === newBankerId,
                    isBaiLaoRevealed: false,
                    isSuspectedBaiLao: false,
                };
            });
        } else {
            const availableProfiles = shuffle([...MOCK_PLAYERS]);
            const findAndPop = (gaze: string) => {
                const idx = availableProfiles.findIndex(p => p.gazeDirection === gaze);
                if (idx !== -1) {
                    const [found] = availableProfiles.splice(idx, 1);
                    return found;
                }
                return null;
            };
            const rightBot = findAndPop('LEFT') || findAndPop('CENTER') || availableProfiles.pop()!;
            const leftBot = findAndPop('RIGHT') || findAndPop('CENTER') || availableProfiles.pop()!;
            const topBot = findAndPop('CENTER') || availableProfiles.pop()!;

            newPlayers = [
                { id: 0, name: userProfile?.username || "You", type: PlayerType.HUMAN, hand: hands[0], trickPile: [], capturedCards: [], isDealer: false, position: 'Bottom', score: 0, profile: userProfile },
                { id: 1, name: rightBot.username, type: PlayerType.AI, hand: hands[1], trickPile: [], capturedCards: [], isDealer: false, position: 'Right', score: 0, profile: rightBot },
                { id: 2, name: topBot.username, type: PlayerType.AI, hand: hands[2], trickPile: [], capturedCards: [], isDealer: false, position: 'Top', score: 0, profile: topBot },
                { id: 3, name: leftBot.username, type: PlayerType.AI, hand: hands[3], trickPile: [], capturedCards: [], isDealer: false, position: 'Left', score: 0, profile: leftBot }
            ];
            newBankerId = Math.floor(Math.random() * 4);
            newPlayers.forEach(p => p.isDealer = p.id === newBankerId);
        }
        
        setPlayers(newPlayers);
        setPot(potCards);
        setMianZhangCard(mianZhang);
        setBankerId(newBankerId);
        
        const offset = (mianZhang.value - 1) % 4;
        const starterId = (newBankerId + offset) % 4;
        setCurrentPlayerIndex(starterId);
        
        setPhase(GamePhase.PLAYING);
        setGameMessage(starterId === 0 ? "You Lead First" : `Player ${starterId} Leads`);
        setTimeout(() => setGameMessage(""), 3000);
        emitEvent('GAME_START', starterId);
    }, 2000);
  };

  const startNextRound = () => {
      startGame(undefined, players);
  };

  const exitToTitle = () => {
      setPhase(GamePhase.DEALING);
      setPlayers([]);
      resetRoundState();
  };

  const advanceTurn = (nextPlayerId: number) => {
      setCurrentPlayerIndex(nextPlayerId);
  };

  const resolveTrick = (cards: { playerId: number, card: Card, isFaceDown: boolean }[], currentPlayers: Player[]) => {
      if (!cards || cards.length === 0) return;
      const leadSuit = cards[0].card.suit;
      let winnerId = cards[0].playerId;
      let maxVal = -1;
      let winningCardRef: Card | null = null;
      
      cards.forEach(tc => {
          if (!tc.isFaceDown && tc.card.suit === leadSuit && tc.card.value > maxVal) {
              maxVal = tc.card.value;
              winnerId = tc.playerId;
              winningCardRef = tc.card;
          }
      });
      if (!winningCardRef) { winnerId = cards[0].playerId; winningCardRef = cards[0].card; }
      setTrickWinnerId(winnerId);
      
      if (winningCardRef.suit === Suit.CASH) {
          const winnerVal = winningCardRef.value;
          const hasQian = cards.some(tc => tc.card.id === ID_QIAN_WAN);
          const hasBai = cards.some(tc => tc.card.id === ID_BAI_WAN);
          setSpecialCaptures(prev => {
              const next = { ...prev };
              if (winnerVal === 11) {
                  if (hasQian) next.wanCaughtQian = true;
                  if (hasBai) next.wanCaughtBai = true;
              } else if (winnerVal === 10) {
                  if (hasBai) next.qianCaughtBai = true;
              }
              return next;
          });
      }

      const isBigWin = winningCardRef.rank === CardRank.ZUN || winningCardRef.rank === CardRank.BAI;
      emitEvent('TRICK_WIN', winnerId, { isBig: isBigWin });

      setTimeout(() => {
          setTrickWinnerId(null);
          setTableCards([]);
          const updatedPlayers = currentPlayers.map(p => {
              let newTrickPile = [...p.trickPile];
              let newCapturedCards = [...p.capturedCards];
              if (p.id === winnerId && winningCardRef) {
                   newTrickPile.push({ card: winningCardRef, isFaceUp: true, round: trickNumber });
                   newCapturedCards.push(winningCardRef);
              }
              return { ...p, trickPile: newTrickPile, capturedCards: newCapturedCards };
          });
          setPlayers(updatedPlayers);
          if (trickNumber === 8) { 
              setPhase(GamePhase.KAI_CHONG); 
              setGameMessage("Kai Chong Phase"); 
              setKaiChongCardIndex(0); 
              setCurrentPlayerIndex(winnerId);
          } else { 
              setTrickNumber(trickNumber + 1); 
              advanceTurn(winnerId);
          }
      }, 1500);
  };

  const executePlayCard = async (playerId: number, cardId: string, bypassRisk: boolean = false) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    const card = player.hand.find(c => c.id === cardId);
    if (!card) return;
    
    // Risk Check
    const tableCardsForRisk = tableCards.map(tc => ({ card: tc.card, playerId: tc.playerId }));
    if (playerId === 0 && config.isRiskAlertOn && !bypassRisk) {
        const risk = evaluatePlayRisk(player, card, tableCardsForRisk, bankerId, players, recordedCards, openedSuits, firstLeadInfo, trickNumber, mianZhangCard, bankerFirstLeadCard);
        if (risk && risk.riskLevel !== RiskLevel.SAFE) {
            setPendingRisk({ cardId, assessment: risk });
            return;
        }
    }
    setPendingRisk(null);
    
    const leadSuit = tableCards.length > 0 ? tableCards[0].card.suit : null;
    let isFaceDown = false;
    if (leadSuit) {
        if (card.suit !== leadSuit) isFaceDown = true;
        else {
             let currentMax = -1;
             tableCards.forEach((tc:any) => { if (!tc.isFaceDown && tc.card.suit === leadSuit && tc.card.value > currentMax) { currentMax = tc.card.value; } });
             if (card.value <= currentMax) isFaceDown = true;
        }
    }
    if (trickNumber === 8 && (!player.capturedCards || player.capturedCards.length === 0)) isFaceDown = true;

    if (!isFaceDown) {
        setFaceUpPlayedCardIds(prev => { const next = new Set(prev); next.add(card.id); return next; });
    }

    const isMillion = card.id === ID_BAI_WAN;
    const isWanWan = card.id === ID_WAN_WAN;
    const isCashLead = tableCards.length === 0 && card.suit === Suit.CASH;
    const isMillionFaceUp = isMillion && !isFaceDown;
    const alreadyRevealed = players.some(p => p.isBaiLaoRevealed);

    const newHand = player.hand.filter(c => c.id !== cardId);
    const updatedPlayers = players.map(p => {
        let newP = p.id === playerId ? { ...p, hand: newHand } : p;
        if (isMillionFaceUp) {
            if (p.id === playerId) newP.isBaiLaoRevealed = true;
            newP.isSuspectedBaiLao = false;
        } else if (!alreadyRevealed) {
            if (p.id === playerId && isCashLead && !isWanWan && !isFaceDown) {
                if (!newP.isSuspectedBaiLao) newP.isSuspectedBaiLao = true;
            }
        }
        return newP;
    });

    setPlayers(updatedPlayers);
    const newTableCards = [...tableCards, { playerId, card, isFaceDown }];
    setTableCards(newTableCards);
    setRecordedCards(prev => [...prev, card]);

    if (tableCards.length === 0) {
        setFirstLeadInfo({ card, playerId });
        
        // Track Banker's First Lead
        if (playerId === bankerId && !bankerFirstLeadCard) {
            setBankerFirstLeadCard(card);
        }

        const isSuitOpened = openedSuits.some(s => s.suit === card.suit);
        if (!isSuitOpened) {
            setOpenedSuits(prev => [...prev, { suit: card.suit, leaderId: playerId, isBanker: playerId === bankerId }]);
        }
    }

    setSelectedCardId(null);
    if (newTableCards.length === 4) { setTimeout(() => resolveTrick(newTableCards, updatedPlayers), 1000); } 
    else { advanceTurn((currentPlayerIndex + 1) % 4); }
  };

  // Bi Zhang
  useEffect(() => {
      if (trickNumber === 8 && phase === GamePhase.PLAYING && tableCards.length === 0) {
          const runBiZhang = async () => {
              setGameMessage("Bi Zhang");
              let currentTable: { playerId: number; card: Card; isFaceDown: boolean }[] = [];
              let tempPlayers = [...players];
              const turnOrder = [0, 1, 2, 3].map(i => (currentPlayerIndex + i) % 4);
              for (const pid of turnOrder) {
                  const p = tempPlayers.find(pl => pl.id === pid)!;
                  if (p.hand.length === 0) continue; 
                  const card = p.hand[0]; 
                  let isFaceDown = false;
                  if (!p.capturedCards || p.capturedCards.length === 0) { isFaceDown = true; } 
                  else if (currentTable.length > 0) {
                      const leadSuit = currentTable[0].card.suit;
                      if (card.suit !== leadSuit) { isFaceDown = true; } 
                      else {
                          let currentMax = -1;
                          currentTable.forEach((tc:any) => { if (!tc.isFaceDown && tc.card.suit === leadSuit && tc.card.value > currentMax) { currentMax = tc.card.value; } });
                          if (card.value <= currentMax) { isFaceDown = true; }
                      }
                  }
                  const newEntry = { playerId: pid, card, isFaceDown };
                  if (!isFaceDown) setFaceUpPlayedCardIds(prev => new Set(prev).add(card.id));
                  currentTable.push(newEntry);
                  tempPlayers = tempPlayers.map(pl => pl.id === pid ? { ...pl, hand: [] } : pl);
                  setPlayers(tempPlayers);
                  setTableCards([...currentTable]); 
                  await new Promise(r => setTimeout(r, 800));
              }
              resolveTrick(currentTable, tempPlayers);
          };
          runBiZhang();
      }
  }, [trickNumber, phase]); 

  // Kai Chong Phase Logic - Fix for stalling
  useEffect(() => {
      let timer: any;
      if (phase === GamePhase.KAI_CHONG) {
          // Check bounds
          if (kaiChongCardIndex < 7) { // 7 Pot Cards
              timer = setTimeout(() => {
                  const currentPotCard = pot[kaiChongCardIndex];
                  const possibleMatches: KaiChongDetail[] = [];
                  players.forEach(p => {
                      const match = findBestKaiChongMatch({ 
                          players, potCard: currentPotCard, lang: config.language, history: kaiChongHistory, currentAttempterId: p.id, specialCaptures 
                      });
                      if (match) possibleMatches.push(match);
                  });

                  // SORT Matches (Priority)
                  const flipperId = currentPlayerIndex;
                  possibleMatches.sort((a, b) => {
                      if (a.priorityScore !== b.priorityScore) return a.priorityScore - b.priorityScore;
                      const distA = (a.playerId - flipperId + 4) % 4;
                      const distB = (b.playerId - flipperId + 4) % 4;
                      return distA - distB;
                  });

                  const winningMatch = possibleMatches[0];

                  if (winningMatch) {
                      setKaiChongHistory(prev => [...prev, winningMatch]);
                      emitEvent('KAI_CHONG_SUCCESS', winningMatch.playerId);
                      setCurrentPlayerIndex(winningMatch.playerId); 
                      // Update Player's pile immediately for visual feedback
                      setPlayers(prevPlayers => prevPlayers.map(p => {
                          if (p.id === winningMatch.playerId) {
                              const duplicateSourceIds = winningMatch.sourceCards.filter(sc => sc.suit === winningMatch.matchedCard.suit && sc.value === winningMatch.matchedCard.value).map(sc => sc.id);
                              // Hide duplicates in the trick pile
                              const newTrickPile = p.trickPile.map(tc => duplicateSourceIds.includes(tc.card.id) ? { ...tc, hidden: true } : tc);
                              // Add pot card (Keep isPot metadata)
                              newTrickPile.push({ card: winningMatch.matchedCard, isFaceUp: true, round: 9, isKaiChong: true });
                              return { ...p, trickPile: newTrickPile, capturedCards: [...p.capturedCards, winningMatch.matchedCard] };
                          }
                          return p;
                      }));
                  } else {
                      emitEvent('KAI_CHONG_FAIL', flipperId);
                      setCurrentPlayerIndex((flipperId + 1) % 4);
                  }
                  
                  // Advance to next card
                  setKaiChongCardIndex(prev => prev + 1);
              }, 1200); // Slower pacing for better visual follow
          } else {
              // End of Round / Scoring
              timer = setTimeout(() => {
                  const scores = calculateRoundScores({ players, bankerId, lang: config.language, kaiChongHistory, violationLog });
                  const newHistory = { ...gameHistory };
                  newHistory.totalRounds = (newHistory.totalRounds || 0) + 1;
                  const bankerScore = scores.find(s => s.playerId === bankerId)?.totalRoundChange || 0;
                  
                  if (bankerScore > 0) { newHistory.bankerWins++; newHistory.lastRoundWinnerType = 'BANKER'; } 
                  else if (bankerScore < 0) { newHistory.peasantWins++; newHistory.lastRoundWinnerType = 'PEASANT'; } 
                  else { newHistory.lastRoundWinnerType = 'DRAW'; }
                  
                  // Update player total scores
                  const updatedPlayers = players.map(p => {
                      const pScore = scores.find(s => s.playerId === p.id);
                      return { ...p, score: p.score + (pScore?.totalRoundChange || 0) };
                  });
                  setPlayers(updatedPlayers);

                  const humanScore = scores.find(s => s.playerId === 0);
                  if (humanScore && humanScore.violations.length > 0) emitEvent('VIOLATION');
                  emitEvent('ROUND_END');

                  const newLearningStates = { ...(newHistory.aiLearningStates || {}) };
                  updatedPlayers.forEach(p => {
                      if (p.type === PlayerType.AI) {
                          const result = scores.find(s => s.playerId === p.id);
                          if (result) {
                              const currentState = getAIState(p.id, gameHistory);
                              newLearningStates[p.id] = updateAILearning(currentState, result, p.id === bankerId, config.difficulty);
                          }
                      }
                  });
                  newHistory.aiLearningStates = newLearningStates;
                  saveGameStats(newHistory);
                  setGameHistory(newHistory);
                  setRoundResults(scores);
                  
                  // CLEAR TABLE BEFORE SHOWING SCORE
                  setTableCards([]);
                  setPot([]);
                  setMianZhangCard(null);
                  setTrickWinnerId(null);
                  
                  setPhase(GamePhase.SCORING);
              }, 1500);
          }
      }
      return () => clearTimeout(timer);
  }, [phase, kaiChongCardIndex]);

  return {
      state: {
          players, deck, pot, tableCards, currentPlayerIndex, phase, bankerId, roundResults, trickNumber, gameMessage,
          recordedCards, faceUpPlayedCardIds, violationLog, openedSuits, firstLeadInfo, gameHistory,
          trickWinnerId, kaiChongCardIndex, kaiChongHistory, mianZhangCard,
          selectedCardId, pendingRisk, violationNotification, lastGameEvent, bankerFirstLeadCard
      },
      actions: {
          startGame, startNextRound, exitToTitle, executePlayCard, 
          setSelectedCardId, setPendingRisk, setViolationNotification
      }
  };
};
