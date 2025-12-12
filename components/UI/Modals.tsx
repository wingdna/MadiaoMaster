
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, GameHistory, Suit, ScoreResult, SupportedLanguage, Player } from '../../types';
import CardComponent from '../Card';
import { initSupabase, uploadAvatar, getSupabaseConfig, clearSupabaseConfig } from '../../services/cloudService';
import { useSkin } from '../../contexts/SkinContext';
import { AppIcon } from '../Visuals/AppIcon';
import { SettingsTab } from '../../hooks/useUIState';
import { TRANSLATIONS } from '../../constants';

// --- SETTINGS COMPONENTS ---

const RecorderView = ({ recordedCards, faceUpPlayedCardIds }: { recordedCards: Card[], faceUpPlayedCardIds: Set<string> }) => {
    const visibleCards = useMemo(() => recordedCards.filter(c => faceUpPlayedCardIds.has(c.id)), [recordedCards, faceUpPlayedCardIds]);
    const grouped = useMemo(() => {
        const groups: Record<string, Card[]> = { [Suit.CASH]: [], [Suit.STRINGS]: [], [Suit.COINS]: [], [Suit.TEXTS]: [] };
        visibleCards.forEach(c => { if (groups[c.suit]) groups[c.suit].push(c); });
        Object.keys(groups).forEach(key => { groups[key].sort((a, b) => b.value - a.value); });
        return groups;
    }, [visibleCards]);
    const suitsOrder = [Suit.CASH, Suit.STRINGS, Suit.COINS, Suit.TEXTS];
    const suitLabels: Record<string, string> = { [Suit.CASH]: 'Cash / 十', [Suit.STRINGS]: 'Strings / 貫', [Suit.COINS]: 'Coins / 索', [Suit.TEXTS]: 'Texts / 文' };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-4 px-2 shrink-0">
                <h4 className="text-[#c5a059] text-sm uppercase tracking-widest font-bold">Public Knowledge</h4>
                <span className="text-xs text-[#5c4025]">Face-Up: {visibleCards.length} / {recordedCards.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                {suitsOrder.map(suit => (
                    <div key={suit} className="bg-[#0a0806] border border-[#2a1d15] rounded-sm p-3 relative">
                        <div className="absolute -top-2 left-3 bg-[#15100e] px-2 text-[10px] text-[#8c6239] uppercase tracking-widest font-bold border border-[#2a1d15]">{suitLabels[suit]}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {grouped[suit].length > 0 ? (grouped[suit].map((card, i) => (<div key={`${card.id}-${i}`} className="transform hover:scale-110 transition-transform origin-bottom duration-200"><CardComponent card={card} isSmall className="shadow-md border-white/5" /></div>))) : (<span className="text-[10px] text-[#3e2b22] italic w-full text-center py-2">No visible cards</span>)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HistoryView = ({ history }: { history: GameHistory }) => (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-2 gap-4 mb-6 text-[#a0a0a0] shrink-0">
            <div className="bg-[#0a0806] p-4 border border-[#2a1d15] text-center rounded-sm"><div className="text-[10px] text-[#5c4025] uppercase tracking-widest mb-1">Total Rounds</div><div className="text-2xl text-[#e6c278] font-bold font-serif">{history.totalRounds}</div></div>
            <div className="bg-[#0a0806] p-4 border border-[#2a1d15] text-center rounded-sm"><div className="text-[10px] text-[#5c4025] uppercase tracking-widest mb-1">Banker vs Peasant</div><div className="text-xl text-[#e6c278] font-serif">{history.bankerWins} : {history.peasantWins}</div></div>
        </div>
        <div className="space-y-3">
            <h4 className="text-[#8c6239] text-[10px] uppercase tracking-widest sticky top-0 bg-[#15100e] py-2 border-b border-[#2a1d15] mb-2">Opponent Intelligence</h4>
            {Object.entries(history.aiLearningStates || {}).map(([pid, state]: [string, any]) => (
                <div key={pid} className="bg-[#0a0806] p-3 border border-[#2a1d15] flex justify-between items-center rounded-sm hover:border-[#3e2b22] transition-colors">
                    <span className="text-[#c5a059] text-xs font-bold">Seat {pid}</span>
                    <div className="text-[10px] text-[#5c4025] flex gap-3 font-mono"><span>AGR: <span className="text-[#a0a0a0]">{state.aggression.toFixed(2)}</span></span><span>RSK: <span className="text-[#a0a0a0]">{state.riskTolerance.toFixed(2)}</span></span></div>
                </div>
            ))}
        </div>
    </div>
);

const GeneralSettingsView = ({ settings, onOpenAdmin }: any) => {
    const { language, setLanguage, oneClickPlay, setOneClickPlay, isRiskAlertOn, setIsRiskAlertOn, isMuted, setIsMuted, graphicsQuality, setGraphicsQuality, githubAutoSync, setGithubAutoSync, showPaperDolls, setShowPaperDolls, isMobileDevice } = settings;
    const { skin, setSkinId, availableSkins } = useSkin(); 
    const [sbUrl, setSbUrl] = useState(''); const [sbKey, setSbKey] = useState(''); const [isConnected, setIsConnected] = useState(false); const [uploadStatus, setUploadStatus] = useState(''); const fileInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { const config = getSupabaseConfig(); if (config.url && config.key) { setSbUrl(config.url); setSbKey(config.key); setIsConnected(initSupabase(config.url, config.key)); } }, []);
    const handleConnect = () => { if (initSupabase(sbUrl, sbKey)) { setIsConnected(true); setUploadStatus("Connected."); } else { setUploadStatus("Failed."); } };
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { setUploadStatus("Uploading..."); const url = await uploadAvatar(e.target.files[0]); if (url) { localStorage.setItem('ma_diao_avatar_url', url); setUploadStatus("Avatar updated!"); } } };
    const Row = ({ label, children }: any) => ( <div className="flex justify-between items-center text-[#a0a0a0] py-2 border-b border-[#2a1d15]/50"> <span className="text-xs uppercase tracking-wide text-[#8c6239] font-bold">{label}</span> {children} </div> );
    const Toggle = ({ active, onClick, labelOn = "ON", labelOff = "OFF" }: any) => ( <button onClick={onClick} className={`px-3 py-1 text-[10px] border transition-all duration-300 font-bold tracking-wider rounded-sm ${active ? 'border-[#c5a059] text-[#15100e] bg-[#c5a059]' : 'border-[#3e2b22] text-[#5c4025] hover:text-[#8c6239]'}`}> {active ? labelOn : labelOff} </button> );

    return (
        <div className="space-y-4 h-full overflow-y-auto custom-scrollbar pr-2">
            <div className="space-y-1">
                <div className="text-[10px] text-[#5c4025] uppercase tracking-[0.3em] mb-2 font-bold">Gameplay</div>
                <Row label="Visual Theme"> <select value={skin.id} onChange={(e) => setSkinId(e.target.value)} className="bg-[#0a0806] border border-[#3e2b22] text-[#c5a059] px-2 py-1 text-[10px] outline-none rounded-sm"> {availableSkins.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)} </select> </Row>
                <Row label="Graphics"> <div className="flex gap-1"> <button onClick={() => setGraphicsQuality('LOW')} className={`px-2 py-1 text-[10px] border ${graphicsQuality === 'LOW' ? 'border-[#c5a059] text-[#c5a059]' : 'border-[#3e2b22] text-[#5c4025]'}`}>Low</button> <button onClick={() => setGraphicsQuality('HIGH')} className={`px-2 py-1 text-[10px] border ${graphicsQuality === 'HIGH' ? 'border-[#c5a059] text-[#c5a059]' : 'border-[#3e2b22] text-[#5c4025]'}`}>High</button> </div> </Row>
                
                {/* CONDITIONAL RENDER: Hide Paper Dolls option on Mobile */}
                {!isMobileDevice && (
                    <Row label="3D Avatars"> <Toggle active={showPaperDolls} onClick={() => setShowPaperDolls(!showPaperDolls)} labelOn="Show" labelOff="Hide" /> </Row>
                )}
                
                <Row label="Language"> <select value={language} onChange={(e:any) => setLanguage(e.target.value)} className="bg-[#0a0806] border border-[#3e2b22] text-[#c5a059] px-2 py-1 text-[10px] outline-none rounded-sm"> {['en', 'zh_CN', 'zh_TW', 'ja', 'ko'].map(l => <option key={l} value={l}>{l}</option>)} </select> </Row>
                <Row label="Control Mode"> <Toggle active={oneClickPlay} onClick={() => setOneClickPlay(!oneClickPlay)} labelOn="1-Click" labelOff="Confirm" /> </Row>
                <Row label="Strategy Hints"> <Toggle active={isRiskAlertOn} onClick={() => setIsRiskAlertOn(!isRiskAlertOn)} /> </Row>
                <Row label="Sound (TTS)"> <Toggle active={!isMuted} onClick={() => setIsMuted(!isMuted)} /> </Row>
            </div>
            <div className="space-y-3 pt-4 border-t border-[#2a1d15]">
                <div className="text-[10px] text-[#5c4025] uppercase tracking-[0.3em] font-bold">System</div>
                <div className="bg-[#0a0806] p-3 border border-[#2a1d15] rounded-sm relative overflow-hidden">
                    <div className="flex justify-between items-center mb-3"> <span className="text-[10px] text-[#8c6239] font-bold">GitHub Sync</span> <Toggle active={githubAutoSync} onClick={() => setGithubAutoSync(!githubAutoSync)} labelOn="Auto" labelOff="Manual" /> </div>
                </div>
                <div className="bg-[#0a0806] p-3 border border-[#2a1d15] rounded-sm">
                    <div className="flex justify-between items-center mb-2"> <span className="text-[10px] text-[#8c6239]">Cloud Save</span> <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_5px_lime]' : 'bg-red-900'}`}></div> </div>
                    {isConnected ? ( <div className="flex gap-2"> <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-1.5 bg-[#3e2b22]/50 text-[#a0a0a0] text-[10px] border border-[#3e2b22] hover:border-[#c5a059] transition-colors">Upload Avatar</button> <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" /> <button onClick={() => { clearSupabaseConfig(); setIsConnected(false); }} className="px-3 text-[10px] text-red-500 border border-red-900/30 hover:bg-red-900/10">Unlink</button> </div> ) : ( <div className="flex gap-2"> <input type="password" placeholder="MemFire/Supabase URL" value={sbUrl} onChange={e => setSbUrl(e.target.value)} className="flex-1 bg-black border border-[#3e2b22] px-2 text-[10px] text-[#c5a059]" /> <input type="password" placeholder="Key" value={sbKey} onChange={e => setSbKey(e.target.value)} className="w-16 bg-black border border-[#3e2b22] px-2 text-[10px] text-[#c5a059]" /> <button onClick={handleConnect} className="px-2 text-[10px] bg-[#3e2b22] text-[#c5a059]">Link</button> </div> )}
                    {uploadStatus && <div className="text-[9px] text-[#c5a059] mt-1 text-right italic">{uploadStatus}</div>}
                </div>
                <button onClick={onOpenAdmin} className="w-full py-2 bg-[#1a1a1a] text-[#333] border border-[#222] text-[10px] uppercase tracking-widest hover:text-[#555] transition-colors"> Admin Portal </button>
            </div>
        </div>
    );
};

export interface SettingsModalProps { onClose: () => void; onOpenAdmin: () => void; settings: any; initialTab?: SettingsTab; gameData?: { recordedCards: Card[]; faceUpPlayedCardIds: Set<string>; gameHistory: GameHistory; }; }

export const SettingsModal = ({ onClose, onOpenAdmin, settings, initialTab = 'GENERAL', gameData }: SettingsModalProps) => {
    const { skin } = useSkin();
    const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
    const IconExportTarget = () => ( <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none" style={{ width: '1024px', height: '1024px' }}> <AppIcon id="app-icon-export-target" size={1024} /> </div> );
    const TabButton = ({ id, label, icon }: { id: SettingsTab, label: string, icon: string }) => ( <button onClick={() => setActiveTab(id)} className={`flex-1 py-3 text-xs uppercase tracking-widest font-bold transition-all duration-300 flex flex-col items-center gap-1 border-b-2 ${activeTab === id ? 'text-[#c5a059] border-[#c5a059] bg-[#c5a059]/10' : 'text-[#5c4025] border-transparent hover:text-[#8c6239] hover:bg-white/5'}`}> <span className="text-lg opacity-80">{icon}</span> <span className="scale-90">{label}</span> </button> );

    return (
        <div className={skin.hud.modalOverlayClass}>
            <IconExportTarget />
            {/* The modal container now uses the Skin's specific styling */}
            <div className={`w-full max-w-lg flex flex-col relative overflow-hidden ${skin.hud.modalContentClass}`} style={{ height: '85vh', maxHeight: '700px' }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-30 pointer-events-none"></div>
                <button onClick={onClose} className="absolute top-4 right-4 text-[#5c4025] hover:text-[#c5a059] z-50 text-xl font-bold">✕</button>
                <div className="flex border-b border-white/10 bg-black/20 shrink-0 z-20 relative"> <TabButton id="RECORDER" label="Recorder" icon="👁" /> <TabButton id="GENERAL" label="Settings" icon="⚙" /> <TabButton id="HISTORY" label="History" icon="📜" /> </div>
                <div className="flex-1 p-6 relative z-10 overflow-hidden">
                    {activeTab === 'RECORDER' && gameData && ( <RecorderView recordedCards={gameData.recordedCards} faceUpPlayedCardIds={gameData.faceUpPlayedCardIds} /> )}
                    {activeTab === 'GENERAL' && ( <GeneralSettingsView settings={settings} onOpenAdmin={onOpenAdmin} /> )}
                    {activeTab === 'HISTORY' && gameData && ( <HistoryView history={gameData.gameHistory} /> )}
                    {((activeTab === 'RECORDER' || activeTab === 'HISTORY') && !gameData) && ( <div className="flex h-full items-center justify-center text-[#5c4025] italic text-xs"> Game data not available. </div> )}
                </div>
            </div>
        </div>
    );
};

// Also export ScoreModal from here if needed by existing imports, or keep Modals_Score separate.
// Assuming Modals_Score is the primary source for ScoreModal, we leave it there.
export { ScoreModal } from './Modals_Score';
