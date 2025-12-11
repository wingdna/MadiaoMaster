
import React, { useMemo, useState, useEffect } from 'react';
import { useMaDiaoGame } from './hooks/useMaDiaoLogic';
import { useAIAgent } from './hooks/useAIAgent';
import { useAudioSystem } from './hooks/useAudioSystem';
import { useGameSettings } from './hooks/useGameSettings';
import { useUIState } from './hooks/useUIState';
import { useGameInteraction } from './hooks/useGameInteraction';
import { Scene3D } from './components/Visuals/Scene3D';
import { PlayerListHUD, HumanHandHUD } from './components/UI/GameInterface';
import { ScoreModal, SettingsModal } from './components/UI/Modals';
import { SocialLoginModal } from './components/UI/SocialLoginModal'; 
import { GamePhase, PlayerType, RiskLevel, UserProfile } from './types';
import Chat from './components/Chat';
import { getSuitStatusContext } from './services/riskEngine';
import { AdminGate } from './components/Admin/AdminGate';
import { platformService } from './services/platformService'; 
import { SkinProvider, useSkin } from './contexts/SkinContext';
import { AppIcon } from './components/Visuals/AppIcon'; 

const GameContent: React.FC = () => {
  const { skin, setSkinId, availableSkins } = useSkin(); 
  const [view, setView] = useState<'GAME' | 'ADMIN'>('GAME');
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);

  // 1. Settings & UI State
  const settings = useGameSettings();
  const ui = useUIState();

  // 2. Core Game Logic
  const { state, actions } = useMaDiaoGame({
      difficulty: settings.difficulty,
      isRiskAlertOn: settings.isRiskAlertOn,
      language: settings.language
  });
  
  // 3. Systems
  const audioSystem = useAudioSystem(settings.isMuted);
  
  // 4. AI Agent
  const { aiChatMessages } = useAIAgent({
      gameState: state,
      gameActions: actions,
      audioSystem: audioSystem,
      isMuted: settings.isMuted,
      language: settings.language
  });

  // 5. Derived State & Interaction Logic
  const humanPlayer = state.players.find(p => p.type === PlayerType.HUMAN);
  
  const { interactionState, handle3DActionClick } = useGameInteraction(
      state, 
      actions, 
      humanPlayer, 
      settings
  );

  // 6. Platform Init
  useEffect(() => {
      const initPlatform = async () => {
          await platformService.init();
          const session = await platformService.auth.checkSession();
          if (session.success && session.user) {
              setUserProfile(session.user);
          }
      };
      initPlatform();
  }, []);

  // 7. Visual Markers Logic
  const humanCardMarkers = useMemo(() => { 
      if (!humanPlayer) return {}; 
      const markers: any = {};
      const { bankerId, openedSuits, recordedCards, firstLeadInfo, faceUpPlayedCardIds, bankerFirstLeadCard } = state;
      
      humanPlayer.hand.forEach(card => {
          const status = getSuitStatusContext(humanPlayer, card, bankerId, openedSuits, recordedCards, firstLeadInfo, faceUpPlayedCardIds, bankerFirstLeadCard);
          markers[card.id] = { isMature: status === 'SAFE', isForbidden: status === 'FORBIDDEN' };
      });
      return markers;
  }, [humanPlayer, state.openedSuits, state.recordedCards, state.bankerId, state.firstLeadInfo, state.faceUpPlayedCardIds, state.bankerFirstLeadCard]);

  // --- Handlers ---
  const handleStartGame = () => actions.startGame(userProfile);
  
  const handleQuitGame = () => {
      if (confirm(settings.language === 'zh_CN' ? "确定要关闭游戏吗？" : "Are you sure you want to quit?")) {
          actions.exitToTitle();
      }
  };

  // Open Unified Modal
  const openRecorder = () => {
      ui.setActiveSettingsTab('RECORDER');
      ui.setShowSettings(true);
  };

  const openSettings = () => {
      ui.setActiveSettingsTab('GENERAL');
      ui.setShowSettings(true);
  };

  if (view === 'ADMIN') return <AdminGate onExit={() => setView('GAME')} />;

  const { phase, currentPlayerIndex, bankerId, selectedCardId, trickNumber } = state;

  return (
    <div className={`perspective-container relative ${skin.layout.backgroundClass} transition-colors duration-1000`}> 
      
      {/* LAYER 1: 3D SCENE */}
      <Scene3D 
          state={state} 
          interactionState={{
              ...interactionState,
              onActionClick: handle3DActionClick
          }}
      />

      {/* LAYER 2: 2D HUD */}
      {phase !== GamePhase.DEALING && phase !== GamePhase.SHUFFLING && (
          <>
            <PlayerListHUD 
                players={state.players} 
                bankerId={bankerId} 
                currentPlayerIndex={currentPlayerIndex} 
                aiChatMessages={aiChatMessages}
            />
            
            {humanPlayer && (
                <HumanHandHUD 
                    player={humanPlayer} 
                    isMyTurn={state.players[currentPlayerIndex]?.id === 0 && phase === GamePhase.PLAYING} 
                    onCardClick={(id: string) => { 
                        if (settings.oneClickPlay) actions.executePlayCard(0, id);
                        else actions.setSelectedCardId(id === selectedCardId ? null : id);
                    }}
                    onDragPlay={(id: string) => actions.executePlayCard(0, id)} 
                    onPlayConfirm={(id: string) => actions.executePlayCard(0, id)} 
                    selectedCardId={selectedCardId} 
                    highlightedCardIds={interactionState.highlightedCardIds}
                    cardMarkers={humanCardMarkers}
                    oneClickPlay={settings.oneClickPlay}
                    canInteract={!interactionState.disabled}
                />
            )}

            {/* Top Right Controls - UNIFIED MENU */}
            <div className="fixed top-4 right-4 z-[200] flex gap-3">
                {/* Recorder Button */}
                <button 
                    onClick={openRecorder} 
                    className="text-[#e6c278] bg-black/40 p-2 rounded-full border border-[#5c4025] hover:bg-[#1a0f0a] hover:border-[#c5a059] backdrop-blur-md transition-all shadow-gem-btn w-12 h-12 flex items-center justify-center group" 
                    title="Recorder"
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">👁</span>
                </button>
                
                {/* Settings Button */}
                <button 
                    onClick={openSettings} 
                    className="text-[#8c6239] bg-black/40 p-2 rounded-full border border-[#3e2b22] hover:bg-[#1a0f0a] hover:border-[#c5a059] hover:text-[#c5a059] backdrop-blur-md transition-all shadow-gem-btn w-12 h-12 flex items-center justify-center group" 
                    title="Menu"
                >
                    <span className="text-xl group-hover:rotate-90 transition-transform duration-500">⚙</span>
                </button>
            </div>
          </>
      )}

      {/* LAYER 3: MODALS & OVERLAYS */}
      
      {/* Risk Alert */}
      {state.pendingRisk && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
              <div className="bg-[#0f0a08] border border-[#5c1010] p-12 max-w-lg w-full rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col items-center text-center relative overflow-hidden">
                  <div className="w-24 h-24 rounded-full bg-[#1a0505] text-[#8c1c0b] flex items-center justify-center text-5xl mb-8 border border-[#3d0e0e] shadow-inner">!</div>
                  <h3 className="text-4xl text-[#8c1c0b] font-serif font-bold tracking-[0.2em] mb-4 drop-shadow-md">{state.pendingRisk.assessment.riskLevel === RiskLevel.PENALTY ? "严重违例" : "战术警示"}</h3>
                  <div className="text-[#5c4025] text-xs uppercase tracking-[0.4em] mb-10 border-b border-[#2a1d15] pb-4 w-full">{state.pendingRisk.assessment.ruleId}</div>
                  <p className="text-[#a0a0a0] mb-12 leading-relaxed font-serif text-xl">{state.pendingRisk.assessment.message}</p>
                  <div className="flex gap-8 w-full">
                      <button onClick={() => actions.setPendingRisk(null)} className="flex-1 py-4 border border-[#2a1d15] text-[#5c4025] hover:text-[#8c6239] hover:border-[#3e2b22] transition-colors uppercase text-xs tracking-[0.3em] font-serif rounded-sm">取消</button>
                      <button onClick={() => actions.executePlayCard(0, state.pendingRisk!.cardId, true)} className="flex-1 py-4 bg-[#3d0e0e] text-[#a0a0a0] border border-[#5c1010] hover:bg-[#5c1010] hover:text-white transition-colors uppercase text-xs tracking-[0.3em] font-bold shadow-lg rounded-sm">强行出牌</button>
                  </div>
              </div>
          </div>
      )}

      {/* Start Menu */}
      {phase === GamePhase.DEALING && (
          <div className={`fixed inset-0 z-[300] flex flex-col items-center justify-center text-[#c5a059] font-serif overflow-hidden transition-all duration-1000 ${skin.layout.backgroundClass}`}>
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a0505] via-transparent to-black opacity-80 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col items-center animate-fade-in-up w-full max-w-md px-6">
                    <div className="mb-8 transform hover:scale-105 transition-transform duration-700">
                        <AppIcon size={120} className="border border-[#5c4025] shadow-[0_0_50px_rgba(197,160,89,0.2)]" />
                    </div>
                    <h1 className="text-6xl md:text-8xl font-bold tracking-[0.2em] mb-2 text-transparent bg-clip-text bg-gradient-to-b from-[#e6c278] to-[#8c6239] drop-shadow-lg font-calligraphy whitespace-nowrap">馬吊大師</h1>
                    
                    {/* SKIN SELECTOR: DROPDOWN */}
                    <div className="relative w-64 mb-12 mt-8 group">
                        <select 
                            value={skin.id} 
                            onChange={(e) => setSkinId(e.target.value)} 
                            className="w-full bg-[#15100e] text-[#c5a059] border border-[#3e2b22] py-3 px-8 text-center font-serif text-lg tracking-widest outline-none rounded-[2px] shadow-lg appearance-none cursor-pointer hover:border-[#5c4025] transition-colors focus:border-[#8c6239]"
                        >
                            {availableSkins.map((s:any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c4025] pointer-events-none group-hover:text-[#8c6239] transition-colors text-xs">▼</div>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        {/* START BUTTON: DIMMED, BREATHING EDGE */}
                        <button 
                            onClick={handleStartGame} 
                            className="w-full py-4 bg-[#0a0503] border border-[#3e2b22] text-[#8c6239] hover:text-[#c5a059] hover:border-[#c5a059] transition-all duration-700 text-xl font-bold tracking-[0.3em] rounded-[1px] shadow-[0_0_20px_rgba(0,0,0,0.8)] animate-breathe-subtle relative overflow-hidden group"
                        >
                            <span className="relative z-10">{userProfile ? "CONTINUE" : "ENTER GAME"}</span>
                            {/* Subtle internal shine on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c5a059]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </button>

                        {!userProfile && (
                            <button onClick={() => ui.setShowSocialModal(true)} className="w-full py-3 bg-transparent border border-[#2a1d15] text-[#5c4025] text-sm font-bold tracking-[0.3em] rounded-[1px] hover:border-[#3e2b22] hover:text-[#8c6239] transition-all">
                                NETWORK BATTLE
                            </button>
                        )}
                        {userProfile && (
                            <button onClick={async () => { await platformService.auth.logout(); setUserProfile(undefined); actions.exitToTitle(); }} className="text-xs text-[#5c4025] hover:text-[#8c6239] mt-2 underline decoration-[#3e2b22]">Sign Out</button>
                        )}
                    </div>
                </div>
          </div>
      )}

      {/* Score Modal */}
      {phase === GamePhase.SCORING && (
          <ScoreModal 
              results={state.roundResults} 
              onClose={() => {}} 
              onNextRound={actions.startNextRound}
              onHome={actions.exitToTitle}
              onQuit={handleQuitGame}
              bankerId={bankerId} 
              language={settings.language} 
              players={state.players} 
          />
      )}
      
      {ui.showSettings && (
          <SettingsModal 
            onClose={() => ui.setShowSettings(false)} 
            onOpenAdmin={() => { ui.setShowSettings(false); setView('ADMIN'); }}
            settings={settings} 
            initialTab={ui.activeSettingsTab}
            gameData={{
                recordedCards: state.recordedCards,
                faceUpPlayedCardIds: state.faceUpPlayedCardIds,
                gameHistory: state.gameHistory
            }}
          />
      )}
      
      {ui.showSocialModal && (
          <SocialLoginModal 
            onClose={() => ui.setShowSocialModal(false)}
            onLoginSuccess={(profile: any) => {
                ui.setShowSocialModal(false);
                setUserProfile(profile);
                actions.startGame(profile);
            }}
          />
      )}

      <Chat language={settings.language} />
    </div>
  );
};

export const App: React.FC = () => {
    return (
        <SkinProvider>
            <GameContent />
        </SkinProvider>
    );
};
