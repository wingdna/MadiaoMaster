
import React, { useState } from 'react';
import { Card, ScoreResult, SupportedLanguage, Player, PlayerType } from '../../types';
import { TRANSLATIONS } from '../../constants';
import CardComponent from '../Card';
import { useSkin } from '../../contexts/SkinContext';

// --- ZOOM OVERLAY ---
const CardZoomOverlay = ({ card, onClose }: { card: Card | null, onClose: () => void }) => {
    if (!card) return null;
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-lg animate-fade-in cursor-zoom-out" onClick={onClose}>
            <div className="relative transform scale-[1.5] md:scale-[2.0] transition-transform duration-300 shadow-[0_0_50px_rgba(0,0,0,1)] rounded-xl" onClick={(e) => e.stopPropagation()}>
                {/* Render a large, interactive-looking card */}
                <div className="w-40 h-64 pointer-events-none">
                    <CardComponent card={card} isTrick={false} isHand={false} isSmall={false} isFaceDown={false} isInverted={card.isPot} />
                </div>
            </div>
            <div className="absolute bottom-10 text-white/50 text-xs md:text-sm font-serif tracking-[0.3em] animate-pulse">
                TAP TO CLOSE
            </div>
        </div>
    );
};

interface ScoreRowProps {
    label: string;
    score: number;
    cards: Card[];
    highlightInverted?: boolean; 
    onCardClick: (card: Card) => void;
}

// HELPER: Truncate Name
const truncateName = (name: string) => {
    return name.length > 8 ? name.substring(0, 8) + '...' : name;
};

// HELPER: Get Flag URL
const getFlagUrl = (countryCode: string | undefined) => {
    const code = countryCode ? countryCode.toLowerCase() : 'cn'; 
    return `https://flagcdn.com/w40/${code}.png`;
};

const ScoreRow: React.FC<ScoreRowProps> = ({ label, score, cards, highlightInverted, onCardClick }) => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/5 p-3 hover:bg-white/5 transition-colors gap-2 md:gap-4 font-serif">
        <div className="w-full md:w-1/3">
            <span className="text-[#a0a0a0] text-sm tracking-wide leading-tight font-bold">{label}</span>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-center w-full md:w-1/3">
            {cards.map((c, i) => {
                const isInverted = c.isPot || (highlightInverted && i === cards.length - 1);
                return (
                    <div key={i} className="relative group cursor-zoom-in z-10 mx-1" onClick={(e) => { e.stopPropagation(); onCardClick(c); }}>
                        <div className="transition-transform duration-200 group-hover:scale-125 group-hover:z-50 origin-center">
                            {/* Force isLocked=true to prevent 3D flip effects on hover, ensure 2D scaling */}
                            <CardComponent card={c} isSmall isInverted={isInverted} isFaceDown={false} isLocked={true} />
                        </div>
                    </div>
                );
            })}
        </div>
        <div className="w-full md:w-1/3 text-right">
            <span className={`font-bold text-lg ${score > 0 ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                {score > 0 ? '+' : ''}{score}
            </span>
        </div>
    </div>
);

export const ScoreModal = ({ 
    results, onClose, onNextRound, onHome, onQuit, bankerId, language, players 
}: { 
    results: ScoreResult[], 
    onClose: () => void, 
    onNextRound: () => void, 
    onHome: () => void,
    onQuit: () => void,
    bankerId: number, 
    language: SupportedLanguage, 
    players: Player[] 
}) => {
    const { skin } = useSkin(); 
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [zoomedCard, setZoomedCard] = useState<Card | null>(null);

    const toggleExpand = (id: number) => { setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); };
    const t = (key: string) => TRANSLATIONS[language][key] || TRANSLATIONS['en'][key];
    const getKcLabel = (type: string) => { const map: Record<string, string> = { 'TONG': 'kc_single', 'BROTHER': 'kc_brother', 'SHUANG_LIN': 'kc_double', 'SHUN_LING': 'kc_seq', 'JIAN_LING': 'kc_gap' }; const key = map[type]; return key ? t(key) : type; };

    const getScoreColor = (val: number) => {
        if (val < 0) return 'text-[#f87171] font-bold'; 
        if (val > 0) return 'text-[#4ade80] font-bold'; 
        return 'text-[#555]'; 
    };

    const getDiaoBadge = (trickCount: number) => {
        if (trickCount < 2) return { text: "赤脚", color: "text-[#f87171] border-[#f87171]" };
        if (trickCount === 2) return { text: "正本", color: "text-[#888] border-[#888]" };
        if (trickCount === 3) return { text: "得吊", color: "text-[#4ade80] border-[#4ade80]" };
        return { text: "双吊", color: "text-emerald-400 border-emerald-400" };
    };

    const RenderVisuals = ({ res }: { res: ScoreResult }) => {
        return (
            <div className="bg-black/40 p-4 md:p-6 animate-fade-in shadow-inner text-sm border-t border-white/10 backdrop-contrast-125">
                
                {/* Mobile Breakdown Grid */}
                <div className="grid grid-cols-5 gap-2 mb-6 md:hidden text-center bg-white/5 p-3 rounded-sm border border-white/5">
                    <div>
                        <div className="text-[8px] text-[#5c4025] uppercase">Diao</div>
                        <div className={getScoreColor(res.diaoPointChange)}>{res.diaoPointChange}</div>
                    </div>
                    <div>
                        <div className="text-[8px] text-[#5c4025] uppercase">Pot</div>
                        <div className={getScoreColor(res.kaiZhuPointChange)}>{res.kaiZhuPointChange}</div>
                    </div>
                    <div>
                        <div className="text-[8px] text-[#5c4025] uppercase">Knock</div>
                        <div className={getScoreColor(res.qiaoMenPointChange)}>{res.qiaoMenPointChange}</div>
                    </div>
                    <div>
                        <div className="text-[8px] text-[#5c4025] uppercase">Meld</div>
                        <div className={getScoreColor(res.seYangPointChange)}>{res.seYangPointChange}</div>
                    </div>
                    <div>
                        <div className="text-[8px] text-[#5c4025] uppercase">Break</div>
                        <div className={getScoreColor(res.kaiChongPointChange)}>{res.kaiChongPointChange}</div>
                    </div>
                </div>

                {res.allCapturedCards && res.allCapturedCards.length > 0 && (
                    <div className="mb-4">
                        <div className="text-[10px] text-[#8c6239] font-serif uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-1">
                            {t('visibleCards')} ({res.cardsWonCount})
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {res.allCapturedCards.map((c, i) => (
                                <div key={i} className="relative group cursor-zoom-in z-10 mx-1" onClick={(e) => { e.stopPropagation(); setZoomedCard(c); }}>
                                    <div className="transition-transform duration-200 group-hover:scale-125 group-hover:z-50 origin-center">
                                        <CardComponent card={c} isSmall isInverted={c.isPot} isFaceDown={false} isLocked={true} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="space-y-2">
                    {[...res.kaiChongDetails.map(k => ({
                        name: getKcLabel(k.matchType), 
                        cards: [...k.sourceCards, k.matchedCard],
                        score: k.score,
                        isInverted: true 
                    })), ...res.patternDetails.map(p => ({
                        name: p.name,
                        cards: p.cards,
                        score: p.score,
                        isInverted: false
                    }))].map((pd: any, i) => (
                         <ScoreRow key={i} label={pd.name} score={pd.score} cards={pd.cards || []} highlightInverted={pd.isInverted} onCardClick={setZoomedCard} />
                    ))}
                    {res.patternDetails.length === 0 && res.kaiChongDetails.length === 0 && <div className="text-center text-[#555] italic py-2">No special patterns</div>}
                </div>
            </div>
        );
    };

    return (
        <div className={skin.hud.modalOverlayClass}>
            {/* ZOOM LAYER */}
            <CardZoomOverlay card={zoomedCard} onClose={() => setZoomedCard(null)} />

            <div className={`w-full max-w-4xl flex flex-col max-h-[90vh] ${skin.hud.modalContentClass}`}>
                
                <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-shimmer-slow" style={{ backgroundSize: '200% 200%' }}></div>

                {/* --- HEADER --- */}
                <div className="relative z-50 flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0 bg-black/40 backdrop-blur-md">
                    <h2 className="text-2xl md:text-3xl tracking-[0.2em] font-bold uppercase font-calligraphy text-[#c5a059] drop-shadow-md">
                        {t('tab_summary')}
                    </h2>
                    <div className="flex items-center gap-3">
                        <button onClick={onHome} className="text-[10px] md:text-xs uppercase tracking-widest text-[#8c6239] hover:text-[#c5a059] transition-colors border border-[#3e2b22] px-3 py-2 rounded-sm hover:border-[#c5a059]">HOME</button>
                        <button onClick={onNextRound} className={skin.hud.buttonClass(false)}>NEXT</button>
                    </div>
                </div>

                {/* --- CONTENT --- */}
                <div className="p-2 md:p-8 relative z-20 overflow-y-auto custom-scrollbar flex-1 space-y-2">
                    {/* Responsive Header Grid */}
                    <div className="grid grid-cols-12 gap-2 text-[10px] uppercase tracking-widest text-[#8c6239] mb-2 px-4 font-bold border-b border-[#3e2b22] pb-2">
                        <div className="col-span-8 md:col-span-4">Player</div>
                        <div className="hidden md:block col-span-1 text-center">Diao</div>
                        <div className="hidden md:block col-span-1 text-center">Pot</div>
                        <div className="hidden md:block col-span-1 text-center">Knock</div>
                        <div className="hidden md:block col-span-1 text-center">Meld</div>
                        <div className="hidden md:block col-span-1 text-center">Break</div>
                        <div className="col-span-4 md:col-span-3 text-right">Total</div>
                    </div>

                    {results.map(res => {
                        const isBanker = res.playerId === bankerId;
                        const isMe = res.playerId === 0;
                        const isExpanded = expandedIds.includes(res.playerId);
                        const playerObj = players.find(p => p.id === res.playerId);
                        const profile = playerObj?.profile;
                        const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/9.x/miniavs/svg?seed=${playerObj?.name || 'Player'}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                        const flagUrl = getFlagUrl(profile?.country || 'cn');

                        return (
                            <div key={res.playerId} className={`group transition-all duration-300 border border-transparent rounded-sm ${isExpanded ? 'bg-white/5 border-white/5' : 'hover:bg-white/5'}`}>
                                <div onClick={() => toggleExpand(res.playerId)} className="grid grid-cols-12 gap-2 items-center p-3 md:p-4 cursor-pointer">
                                    <div className="col-span-8 md:col-span-4 flex items-center gap-3">
                                        <div className={`w-5 h-5 md:w-6 md:h-6 flex items-center justify-center border text-[9px] md:text-[10px] font-serif rounded-sm ${isBanker ? 'border-red-800 text-red-500 bg-red-900/20' : 'border-[#333] text-[#666]'}`}>
                                            {isBanker ? '庄' : '闲'}
                                        </div>
                                        <div className="relative">
                                            <div className="relative w-8 h-8 rounded-full border border-[#3e2b22] overflow-hidden shrink-0 shadow-lg">
                                                <img src={avatarUrl} alt="" className="w-full h-full object-cover filter brightness-90" />
                                            </div>
                                            {/* Flag Badge - Stamp Style */}
                                            <div className="absolute -bottom-2 -right-2 w-5 h-4 bg-[#1a0505] border border-[#5c4025] shadow-md transform rotate-12 z-10 flex items-center justify-center p-[1px]">
                                                <img src={flagUrl} alt={profile?.country} className="w-full h-full object-cover opacity-90" />
                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 pointer-events-none"></div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <div className="flex items-center gap-1">
                                                <span className={`text-sm font-bold tracking-wider truncate ${isMe ? 'text-[#e6c278]' : 'text-[#a0a0a0]'}`}>
                                                    {truncateName(profile?.username || playerObj?.name || '')}
                                                </span>
                                            </div>
                                            {!isBanker && (
                                                <span className={`text-[8px] border px-1 w-max mt-0.5 opacity-80 ${getDiaoBadge(res.trickCount).color}`}>
                                                    {getDiaoBadge(res.trickCount).text}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Desktop Columns */}
                                    <div className={`hidden md:block col-span-1 text-center ${getScoreColor(res.diaoPointChange)}`}>{res.diaoPointChange}</div>
                                    <div className={`hidden md:block col-span-1 text-center ${getScoreColor(res.kaiZhuPointChange)}`}>{res.kaiZhuPointChange}</div>
                                    <div className={`hidden md:block col-span-1 text-center ${getScoreColor(res.qiaoMenPointChange)}`}>{res.qiaoMenPointChange}</div>
                                    <div className={`hidden md:block col-span-1 text-center ${getScoreColor(res.seYangPointChange)}`}>{res.seYangPointChange}</div>
                                    <div className={`hidden md:block col-span-1 text-center ${getScoreColor(res.kaiChongPointChange)}`}>{res.kaiChongPointChange}</div>
                                    
                                    <div className="col-span-4 md:col-span-3 text-right">
                                        <span className={`text-2xl font-serif font-bold ${res.totalRoundChange > 0 ? 'text-[#e6c278]' : (res.totalRoundChange < 0 ? 'text-[#f87171]' : 'text-[#555]')}`}>
                                            {res.totalRoundChange > 0 ? '+' : ''}{res.totalRoundChange}
                                        </span>
                                        <div className="md:hidden text-[9px] text-[#5c4025] uppercase tracking-widest mt-1">Tap for Details</div>
                                    </div>
                                </div>
                                {isExpanded && <RenderVisuals res={res} />}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
