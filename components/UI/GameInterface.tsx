
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import CardComponent from '../Card';
import { Player, Card, PlayerType } from '../../types';
import { useSkin } from '../../contexts/SkinContext';

// --- HELPERS ---

const getDiaoStatus = (trickPile: any[]) => {
    if (!trickPile || !Array.isArray(trickPile)) return { text: "-", color: "bg-black/40", textColor: "text-white/40" };
    const trickCount = trickPile.filter(t => t.round <= 8 && !t.isKaiChong && t.isFaceUp).length;
    
    if (trickCount < 2) return { text: "赤脚", color: "bg-red-900/90", textColor: "text-red-100" }; 
    if (trickCount === 2) return { text: "正本", color: "bg-stone-800/90", textColor: "text-stone-300" }; 
    if (trickCount === 3) return { text: "得吊", color: "bg-emerald-900/90", textColor: "text-emerald-200" }; 
    return { text: "双吊", color: "bg-emerald-600/90", textColor: "text-white" }; 
};

const truncateName = (name: string) => {
    if (!name) return "Player";
    return name.length > 5 ? name.substring(0, 4) + '.' : name;
};

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23333'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23666'/%3E%3Cpath d='M20 90 Q50 60 80 90' fill='%23666'/%3E%3C/svg%3E";

// --- PLAYER HUD ---

export const PlayerListHUD = React.memo(({ players, bankerId, currentPlayerIndex, aiChatMessages }: { players: Player[], bankerId: number, currentPlayerIndex: number, aiChatMessages: Record<number, string | null> }) => {
    const { skin } = useSkin();
    const displayPlayers = players.filter(p => p.type !== PlayerType.HUMAN);

    return (
        <div className="fixed inset-0 pointer-events-none z-[200]">
            {displayPlayers.map((player) => {
                const isMyTurn = players[currentPlayerIndex]?.id === player.id;
                const isBanker = player.id === bankerId;
                const isBaiLao = player.isBaiLaoRevealed || player.isSuspectedBaiLao;
                const profile = player.profile;
                const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/9.x/miniavs/svg?seed=${player.name}&backgroundColor=transparent`;
                const diaoStatus = getDiaoStatus(player.trickPile);
                const chatMsg = aiChatMessages[player.id];

                let posClass = 'hidden';
                if (player.position === 'Top') {
                    // Mobile: Pinned to absolute top edge
                    posClass = 'top-[2%] landscape:top-[2%] left-1/2 -translate-x-1/2';
                } else if (player.position === 'Left') {
                    // Mobile V33: Updated to 28% to sit ABOVE the hand stack (which is at 42%)
                    // Avatar (28%) -> Hand (42%) -> Won (56%)
                    posClass = 'top-[28%] left-[2%] landscape:top-[35%] landscape:left-[1%]';
                } else if (player.position === 'Right') {
                    // Mobile V33: Updated to 28%
                    posClass = 'top-[28%] right-[2%] landscape:top-[35%] landscape:right-[1%]';
                }

                return (
                    <div key={player.id} className={`absolute flex flex-col items-center pointer-events-auto transition-all duration-500 ${posClass}`}>
                        <div className={`overflow-hidden ${skin.hud.avatarContainerClass(isMyTurn)} relative group`}>
                            <img 
                                src={avatarUrl} 
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                                alt={player.name}
                                onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none"></div>
                            <div className="absolute top-1 left-1 z-10">
                                <span className="text-[8px] md:text-[10px] font-mono text-[#e6c278] bg-black/60 px-1.5 rounded-[2px] border border-[#3e2b22] backdrop-blur-[2px] shadow-sm">
                                    {player.hand.length}
                                </span>
                            </div>
                            <div className="absolute top-1 right-1 flex flex-col gap-0.5 items-end z-10">
                                {isBanker && (
                                    <div className="w-3.5 h-3.5 md:w-4 md:h-4 bg-[#8c1c0b] text-[#e8e4d9] rounded-full flex items-center justify-center text-[8px] md:text-[9px] font-bold border border-[#b8860b] shadow-md leading-none">
                                        庄
                                    </div>
                                )}
                                {isBaiLao && (
                                    <div className="w-3.5 h-3.5 md:w-4 md:h-4 bg-[#047857] text-[#e8e4d9] rounded-full flex items-center justify-center text-[8px] md:text-[9px] font-bold border border-[#34d399] shadow-md leading-none">
                                        百
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-0 inset-x-0 flex flex-col z-10">
                                <div className="text-[8px] md:text-[10px] text-center text-[#e8e4d9] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,1)] truncate px-1 pb-[1px]">
                                    {truncateName(profile?.username || player.name)}
                                </div>
                                <div className={`h-3.5 md:h-4 w-full flex items-center justify-center ${diaoStatus.color} backdrop-blur-sm`}>
                                    <span className={`text-[7px] md:text-[9px] font-serif font-bold ${diaoStatus.textColor} scale-90`}>{diaoStatus.text}</span>
                                </div>
                            </div>
                        </div>
                        {chatMsg && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-28 md:w-36 z-[300] animate-fade-in-up">
                                <div className="bg-[#e8e4d9]/95 text-[#1a0505] p-2 rounded-sm text-[9px] md:text-[11px] font-serif shadow-xl border border-[#c5a059] text-center relative leading-tight">
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#e8e4d9] transform rotate-45 border-l border-t border-[#c5a059]"></div>
                                    {chatMsg}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
});

// --- HUMAN HAND HUD ---

export const HumanHandHUD = React.memo(({ player, isMyTurn, onCardClick, onDragPlay, onPlayConfirm, selectedCardId, highlightedCardIds, cardMarkers, oneClickPlay, canInteract, actionLabel, mianZhangCard }: any) => {
    const { skin } = useSkin();
    const dragStateRef = useRef<{id: string, startX: number, startY: number, currentX: number, currentY: number} | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null); 
    const [dragTransform, setDragTransform] = useState<{x: number, y: number} | null>(null);
    const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
    
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 375);
    const [isPortrait, setIsPortrait] = useState(typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : true);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setIsPortrait(window.innerHeight > window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!player || player.type !== PlayerType.HUMAN) return null;

    const profile = player.profile;
    const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/9.x/miniavs/svg?seed=Me&backgroundColor=transparent`;
    const diaoStatus = getDiaoStatus(player.trickPile);
    const isBanker = player.isDealer;
    const isBaiLao = player.isBaiLaoRevealed || player.isSuspectedBaiLao;

    const handleLocalCardClick = useCallback((id: string) => { 
        if (!canInteract) return; 
        if (oneClickPlay) onPlayConfirm(id); else onCardClick(id); 
    }, [canInteract, oneClickPlay, onPlayConfirm, onCardClick]);

    const handleActionClick = () => {
        if (!canInteract) return;
        if (selectedCardId) onPlayConfirm(selectedCardId);
        else if (highlightedCardIds && highlightedCardIds.size > 0) {
            const firstId = Array.from(highlightedCardIds)[0];
            onPlayConfirm(firstId);
        } else if (player.hand.length > 0) {
            onPlayConfirm(player.hand[0].id);
        }
    };

    const handleStart = (clientX: number, clientY: number, cardId: string) => {
        if (!canInteract) return;
        dragStateRef.current = { id: cardId, startX: clientX, startY: clientY, currentX: clientX, currentY: clientY };
        setDraggingId(cardId);
        setDragTransform({ x: 0, y: 0 });
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!dragStateRef.current) return;
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
            dragStateRef.current.currentX = clientX;
            dragStateRef.current.currentY = clientY;
            setDragTransform({ x: clientX - dragStateRef.current.startX, y: clientY - dragStateRef.current.startY });
        };
        const handleEnd = () => {
            if (dragStateRef.current) {
                const { id, startY, currentY, startX, currentX } = dragStateRef.current;
                if (currentY - startY < -80) onDragPlay(id);
                else if (Math.abs(currentX - startX) < 10 && Math.abs(currentY - startY) < 10) handleLocalCardClick(id);
                dragStateRef.current = null; setDraggingId(null); setDragTransform(null);
            }
        };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchend', handleEnd);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [handleLocalCardClick, onDragPlay]);

    const handSize = player.hand.length;
    const isMobile = windowWidth < 768; 

    // V45 Update: Slightly wider cards (5.8rem) and minimal padding (2px) to better fill mobile screen width
    const CARD_WIDTH_REM = isMobile ? 5.8 : 7.5; 
    const PIXELS_PER_REM = 16;
    const CARD_WIDTH_PX = CARD_WIDTH_REM * PIXELS_PER_REM;
    const SCREEN_PADDING = isMobile ? 2 : 100; 
    const AVAILABLE_WIDTH = windowWidth - SCREEN_PADDING;

    const getBasePosition = (i: number) => {
        if (isMobile) {
            let xOffset = 0;
            const totalWidthNoOverlap = handSize * CARD_WIDTH_PX;
            if (totalWidthNoOverlap <= AVAILABLE_WIDTH) {
                const gap = 5; 
                const totalSetWidth = totalWidthNoOverlap + ((handSize - 1) * gap);
                const startX = -(totalSetWidth / 2) + (CARD_WIDTH_PX / 2);
                xOffset = startX + i * (CARD_WIDTH_PX + gap);
            } else {
                const step = (AVAILABLE_WIDTH - CARD_WIDTH_PX) / (handSize - 1);
                const startX = -(AVAILABLE_WIDTH / 2) + (CARD_WIDTH_PX / 2);
                xOffset = startX + i * step;
            }

            return {
                x: xOffset, y: 0, rot: 0, scale: 1.0, zIndex: 100 + i,
                width: `${CARD_WIDTH_REM}rem`, marginLeft: `-${CARD_WIDTH_REM/2}rem`, 
                bottom: '10px', transformOrigin: `center bottom`
            };
        } else {
            const dArcRadius = 800; 
            const dMaxFanAngle = 40; 
            let dFanAngle = Math.min(dMaxFanAngle, handSize * 5);
            const dStartAngle = -dFanAngle / 2;
            const dAngleStep = handSize > 1 ? dFanAngle / (handSize - 1) : 0;
            const angleDeg = dStartAngle + (i * dAngleStep);
            
            return {
                x: 0, y: 0, rot: angleDeg, scale: 1.0, zIndex: 100 + i,
                width: '7.5rem', marginLeft: '-3.75rem', 
                bottom: '30px', transformOrigin: `50% ${dArcRadius}px`
            };
        }
    };

    // --- MOBILE PORTRAIT CONTROLS ---
    const MobilePortraitControls = () => {
        const isActive = canInteract;
        
        // V11 Update: Added more padding and specific separator class to fix fused text
        const baseClasses = "flex items-center gap-6 px-6 py-2 rounded-full transition-all duration-500 backdrop-blur-md border shadow-lg min-w-[240px] justify-between relative overflow-hidden";
        
        const activeClasses = "bg-gradient-to-r from-[#3e2b22] to-[#1a0b05] border-[#d4af37] cursor-pointer animate-pulse-slow ring-1 ring-[#d4af37]/50 shadow-[0_0_15px_rgba(212,175,55,0.3)] transform scale-110";
        const passiveClasses = "bg-[#0a0605]/80 border-[#3e2b22] shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)] grayscale-[0.3]";

        return (
            <div 
                // V21 Update: Dropped to 15% (from 18%) to clear the table loot view
                className={`absolute bottom-[15%] left-1/2 -translate-x-1/2 z-[90] transition-all duration-500 ease-out flex items-center justify-center`}
                onClick={isActive ? handleActionClick : undefined}
            >
                <div className={`${baseClasses} ${isActive ? activeClasses : passiveClasses}`}>
                     
                     {/* Avatar (Left Side) */}
                     <div className={`relative w-8 h-8 rounded-full border-2 ${isActive ? 'border-[#ffdb7a] ring-2 ring-[#5c4025]' : 'border-[#5c4025]'} overflow-hidden shrink-0 transition-colors duration-500`}>
                         <img src={avatarUrl} className="w-full h-full object-cover" alt="Me" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}/>
                     </div>
                     
                     {/* Vertical Separator - V11: Explicit Divider with Margin */}
                     <div className={`absolute left-[3.5rem] top-1/2 -translate-y-1/2 w-[1px] h-6 ${isActive ? 'bg-[#ffdb7a]/50' : 'bg-[#3e2b22]'}`}></div>

                     {/* Content (Center/Right Side) */}
                     <div className="flex items-center flex-1 justify-center transition-all duration-300 pl-4">
                         {isActive ? (
                             <span className="text-[#ffdb7a] font-calligraphy text-2xl font-bold tracking-widest drop-shadow-md whitespace-nowrap px-2">
                                 {actionLabel || "出牌"}
                             </span>
                         ) : (
                             <div className="flex items-center gap-3 px-1">
                                 <div className="text-[10px] text-[#8c6239] font-serif font-bold tracking-wider uppercase">
                                     {isBanker ? 'Banker' : (isBaiLao ? 'Million' : 'Wait')}
                                 </div>
                                 <div className="w-[1px] h-3 bg-[#3e2b22]"></div>
                                 <div className={`text-[10px] font-mono font-bold ${player.score >= 0 ? 'text-[#4ade80]' : 'text-[#ff6b6b]'}`}>
                                     {player.score}
                                 </div>
                             </div>
                         )}
                     </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] perspective-container overflow-visible" style={{ perspective: '1200px' }}>
            
            {/* MIAN ZHANG INDICATOR (Top Left 2D) */}
            {mianZhangCard && (
                <div className="absolute top-[2%] left-4 z-[200] flex flex-col items-center gap-1 animate-fade-in pointer-events-auto">
                    <div className="relative w-8 h-12">
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="absolute inset-0 border border-[#3e2b22] bg-[#0a0505] rounded-[2px]" 
                                 style={{ 
                                     transform: `translate(${i * 2}px, ${i * 2}px)`, 
                                     zIndex: -i 
                                 }}>
                            </div>
                        ))}
                        <div className="absolute inset-0 transform scale-75 origin-top-left z-10" style={{ transform: 'translate(4px, 4px)' }}>
                            <CardComponent card={mianZhangCard} isSmall isInverted={true} isFaceDown={false} />
                        </div>
                    </div>
                </div>
            )}

            {isMobile && isPortrait ? (
                <MobilePortraitControls />
            ) : (
                /* Desktop/Landscape Avatar */
                <div className="absolute bottom-[40px] right-[5%] pointer-events-auto flex flex-col items-center z-[150] animate-fade-in-up">
                    <div className={`overflow-hidden ${skin.hud.avatarContainerClass(isMyTurn)} relative group`}>
                        <img src={avatarUrl} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt="Me" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}/>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none"></div>
                        <div className="absolute top-1 right-1 flex flex-col gap-0.5 items-end z-10">
                            {isBanker && <div className="w-3.5 h-3.5 md:w-4 md:h-4 bg-[#8c1c0b] text-[#e8e4d9] rounded-full flex items-center justify-center text-[8px] md:text-[9px] font-bold border border-[#b8860b] shadow-sm leading-none">庄</div>}
                            {isBaiLao && <div className="w-3.5 h-3.5 md:w-4 md:h-4 bg-[#047857] text-[#e8e4d9] rounded-full flex items-center justify-center text-[8px] md:text-[9px] font-bold border border-[#34d399] shadow-sm leading-none">百</div>}
                        </div>
                        <div className="absolute bottom-0 inset-x-0 flex flex-col z-10">
                            <div className="text-[8px] md:text-[10px] text-center text-[#e8e4d9] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] truncate px-1 pb-[1px]">
                                {truncateName("You")}
                            </div>
                            <div className={`h-3.5 md:h-4 w-full flex items-center justify-center ${diaoStatus.color} backdrop-blur-sm`}>
                                <span className={`text-[7px] md:text-[9px] font-serif font-bold ${diaoStatus.textColor} scale-90`}>{diaoStatus.text}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`mt-1 text-lg font-bold font-serif ${player.score >= 0 ? 'text-[#4ade80]' : 'text-[#ff6b6b]'} drop-shadow-md bg-black/60 px-2 rounded-full border border-white/10`}>
                        {player.score}
                    </div>
                </div>
            )}

            {/* HAND CONTAINER */}
            <div className="absolute left-1/2 w-full flex justify-center items-end pointer-events-none" style={{ transformStyle: 'preserve-3d', transform: 'translateX(-50%)', bottom: '0px', height: '0px', zIndex: 200 }}>
                {player.hand.map((card: Card, i: number) => {
                    const pos = getBasePosition(i);
                    const isDragging = draggingId === card.id;
                    if (isDragging) return null;

                    const style: React.CSSProperties = isMobile ? {
                        position: 'absolute', left: '50%', bottom: pos.bottom,
                        width: pos.width, marginLeft: pos.marginLeft,
                        transform: `translate3d(${pos.x}px, ${pos.y}px, ${i}px)`, 
                        zIndex: 300 
                    } : {
                        position: 'absolute', left: '50%', bottom: pos.bottom,
                        width: pos.width, marginLeft: pos.marginLeft,
                        transformOrigin: pos.transformOrigin,
                        transform: `rotateZ(${pos.rot}deg) translateZ(${i}px)`,
                        zIndex: 300
                    };

                    return (
                        <div key={`hit-${card.id}`}
                             className="pointer-events-auto opacity-0 cursor-pointer"
                             style={{ ...style, height: isMobile ? '8rem' : '10rem' }} 
                             onMouseDown={(e) => handleStart(e.clientX, e.clientY, card.id)} 
                             onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY, card.id)} 
                             onMouseEnter={() => setHoveredCardId(card.id)} 
                             onMouseLeave={() => setHoveredCardId(null)}
                        />
                    );
                })}

                {player.hand.map((card: Card, i: number) => {
                    const pos = getBasePosition(i);
                    const isDragging = draggingId === card.id;
                    const isHovered = hoveredCardId === card.id;
                    const isVisuallySelected = canInteract && (selectedCardId === card.id || isHovered);
                    const isHighlighted = highlightedCardIds && highlightedCardIds.has(card.id);
                    const markers = cardMarkers ? cardMarkers[card.id] : { isMature: false, isForbidden: false };

                    let style: React.CSSProperties = {};

                    if (isDragging && dragTransform) {
                        style = {
                            position: 'absolute', left: '50%', bottom: isMobile ? '100px' : '150px',
                            transform: `translate(${dragTransform.x}px, ${dragTransform.y}px) scale(1.1) rotateZ(0deg)`,
                            width: isMobile ? '5.5rem' : '7.5rem',
                            transformOrigin: 'center center', zIndex: 1000,
                        };
                    } else if (isMobile) {
                        const liftY = isVisuallySelected ? -30 : 0;
                        const liftZ = isVisuallySelected ? 50 : 0;
                        const scale = isVisuallySelected ? 1.15 : 1.0;
                        
                        style = {
                            position: 'absolute', left: '50%', bottom: pos.bottom,
                            marginLeft: pos.marginLeft, width: pos.width,
                            transformOrigin: 'center bottom',
                            transform: `translate3d(${pos.x}px, ${pos.y + liftY}px, ${i + liftZ}px) scale(${scale})`, 
                            zIndex: isVisuallySelected ? 200 : pos.zIndex,
                            transition: 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        };
                    } else {
                        let liftY = 0; let liftZ = 0; let scale = 1.0; 
                        const rotZ = pos.rot;
                        if (isVisuallySelected) { liftY = -30; liftZ = 50; scale = 1.15; }
                        
                        style = {
                            position: 'absolute', left: '50%', bottom: pos.bottom,
                            marginLeft: pos.marginLeft, width: pos.width,
                            transformOrigin: pos.transformOrigin,
                            transform: `rotateZ(${rotZ}deg) translateY(${liftY}px) translateZ(${i + liftZ}px) scale(${scale})`,
                            zIndex: isVisuallySelected ? 200 : pos.zIndex,
                            transition: 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        };
                    }

                    return (
                        <div key={`vis-${card.id}`} className="pointer-events-none" style={style}>
                            <div className="w-full h-full rounded-[4px]">
                                <CardComponent 
                                    card={card} isHand isDisabled={false} isSelected={isVisuallySelected} 
                                    suitStatus={markers.isMature ? 'SAFE' : (markers.isForbidden ? 'FORBIDDEN' : 'NEUTRAL')} 
                                    isDraggable={false} isSuggested={isHighlighted} 
                                    isSuspectedBaiLao={player.isSuspectedBaiLao} isBaiLao={false} isBanker={false} isFaceDown={false}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
