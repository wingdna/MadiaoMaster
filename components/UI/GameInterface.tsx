
import React, { useRef, useState, useEffect, useCallback } from 'react';
import CardComponent from '../Card';
import { Player, Card, PlayerType } from '../../types';

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
    return name.length > 4 ? name.substring(0, 3) + '..' : name;
};

// --- PLAYER HUD ---

export const PlayerListHUD = React.memo(({ players, bankerId, currentPlayerIndex, aiChatMessages }: { players: Player[], bankerId: number, currentPlayerIndex: number, aiChatMessages: Record<number, string | null> }) => {
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

                // CSS Position Classes based on Seat and Orientation
                // Note: These align with Scene3D's visual placement
                let posClass = 'hidden';
                if (player.position === 'Top') {
                    // Top is always centered top
                    posClass = 'top-[2%] left-1/2 -translate-x-1/2';
                } else if (player.position === 'Left') {
                    // Mobile Portrait: Top-Left corner area
                    // Landscape: Vertically centered left
                    posClass = 'top-[15%] left-[2%] landscape:top-1/2 landscape:-translate-y-1/2 landscape:left-[2%] portrait:md:top-[30%]';
                } else if (player.position === 'Right') {
                    // Mobile Portrait: Top-Right corner area
                    // Landscape: Vertically centered right
                    posClass = 'top-[15%] right-[2%] landscape:top-1/2 landscape:-translate-y-1/2 landscape:right-[2%] portrait:md:top-[30%]';
                }

                return (
                    <div key={player.id} className={`absolute flex flex-col items-center pointer-events-auto transition-all duration-500 ${posClass}`}>
                        {/* Avatar Container */}
                        <div className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-lg ${isMyTurn ? 'border-[#c5a059] scale-110 shadow-[0_0_15px_rgba(197,160,89,0.6)] ring-2 ring-[#c5a059]/50 z-10' : 'border-[#3e2b22] bg-[#15100e] grayscale-[0.3]'}`}>
                            <img src={avatarUrl} className="w-full h-full object-cover" alt={player.name} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

                            {/* Badges */}
                            <div className="absolute top-0 right-0 flex p-0.5 gap-0.5">
                                {isBanker && <div className="w-3 h-3 md:w-4 md:h-4 bg-[#8c1c0b] text-[#e8e4d9] rounded-full flex items-center justify-center text-[6px] md:text-[8px] font-bold border border-[#b8860b]">庄</div>}
                                {isBaiLao && <div className="w-3 h-3 md:w-4 md:h-4 bg-[#c5a059] text-[#1a0505] rounded-full flex items-center justify-center text-[6px] md:text-[8px] font-bold border border-[#3e2b22]">百</div>}
                            </div>

                            <div className={`absolute bottom-0 inset-x-0 h-3 md:h-4 flex items-center justify-center ${diaoStatus.color}`}>
                                <span className={`text-[6px] md:text-[8px] font-serif font-bold ${diaoStatus.textColor} leading-none scale-90`}>{diaoStatus.text}</span>
                            </div>
                        </div>

                        {/* Name Label */}
                        <div className="mt-1">
                            <span className="text-[8px] md:text-[10px] text-[#e8e4d9] font-bold leading-none drop-shadow-md bg-black/50 px-1.5 py-0.5 rounded-sm backdrop-blur-sm border border-white/10">
                                {truncateName(profile?.username || player.name)}
                            </span>
                        </div>

                        {/* Card Count */}
                        <div className="absolute -top-1 -left-1 bg-[#1a0505] text-[#8c6239] text-[8px] w-4 h-4 flex items-center justify-center rounded-full border border-[#3e2b22] shadow-sm font-mono z-20">
                            {player.hand.length}
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

export const HumanHandHUD = React.memo(({ player, isMyTurn, onCardClick, onDragPlay, onPlayConfirm, selectedCardId, highlightedCardIds, cardMarkers, oneClickPlay, canInteract }: any) => {
    const dragStateRef = useRef<{id: string, startX: number, startY: number, currentX: number, currentY: number} | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null); 
    const [dragTransform, setDragTransform] = useState<{x: number, y: number} | null>(null);
    const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
    
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 375);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
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
    const centerIndex = (handSize - 1) / 2;
    const isMobile = windowWidth < 768;
    const availableWidth = windowWidth - 20; 
    
    // Dynamic Spacing Logic: Increase gap as cards decrease to prevent misclicks on mobile
    let baseGap = isMobile ? 45 : 100;
    if (isMobile) {
        if (handSize <= 4) baseGap = 80;
        else if (handSize <= 6) baseGap = 60;
    }
    
    const idealTotalWidth = (handSize - 1) * baseGap;
    let cardSpacing = baseGap;
    if (idealTotalWidth > availableWidth) cardSpacing = availableWidth / Math.max(1, handSize - 1);

    const cardWidthRem = 5.5; 

    return (
        <div className="fixed bottom-0 left-0 right-0 h-screen pointer-events-none z-[100]">
            
            {/* Avatar - Bottom Right */}
            <div className="absolute bottom-[180px] md:bottom-[30px] right-[5%] md:right-[5%] pointer-events-auto flex flex-col items-center z-[150] animate-fade-in-up">
                <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all duration-300 ${isMyTurn ? 'border-[#c5a059] ring-2 ring-[#c5a059]/50' : 'border-[#3e2b22] grayscale-[0.3]'}`}>
                    <img src={avatarUrl} className="w-full h-full object-cover" alt="Me" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none"></div>
                    <div className="absolute top-1 right-1 flex flex-col gap-0.5 items-center">
                        {isBanker && <span className="bg-[#8c1c0b] text-[#e8e4d9] text-[8px] w-4 h-4 flex items-center justify-center rounded-full border border-[#b8860b] shadow-sm font-bold">庄</span>}
                        {isBaiLao && <span className="bg-[#c5a059] text-[#1a0505] text-[8px] w-4 h-4 flex items-center justify-center rounded-full border border-[#3e2b22] shadow-sm font-bold">百</span>}
                    </div>
                    <div className={`absolute bottom-0 inset-x-0 h-5 flex items-center justify-center ${diaoStatus.color}`}>
                        <span className={`text-[8px] font-bold ${diaoStatus.textColor}`}>{diaoStatus.text}</span>
                    </div>
                </div>
                <div className={`mt-1 text-lg font-bold font-serif ${player.score >= 0 ? 'text-[#4ade80]' : 'text-[#ff6b6b]'} drop-shadow-md bg-black/60 px-2 rounded-full border border-white/10`}>
                    {player.score}
                </div>
            </div>

            {/* Hand Cards Container */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end justify-center pointer-events-auto pb-4 w-full h-[220px]">
                {/* 
                    LAYOUT FIX: 
                    Instead of width: 100%, we use width: 0px and rely on absolute positioning from center.
                    This prevents card 'squashing' in flex containers on some mobile browsers/themes.
                */}
                <div className="relative flex items-end justify-center transition-all duration-500" style={{ position: 'absolute', bottom: '2%', width: '0px' }}>
                    {player.hand.map((card: Card, i: number) => {
                        const isDragging = draggingId === card.id;
                        const xOffset = (i - centerIndex) * cardSpacing;
                        const zIndex = isDragging ? 1000 : (hoveredCardId === card.id ? 200 : 100 + i);
                        const isVisuallySelected = canInteract && (selectedCardId === card.id || hoveredCardId === card.id); 
                        const isHighlighted = highlightedCardIds && highlightedCardIds.has(card.id); 
                        const markers = cardMarkers ? cardMarkers[card.id] : { isMature: false, isForbidden: false };
                        const liftAmount = isMobile ? -20 : -40;
                        const dragStyle = isDragging && dragTransform ? { transform: `translate(${xOffset + dragTransform.x}px, ${-50 + dragTransform.y}px) scale(1.15)` } : { transform: `translateX(${xOffset}px) ${isVisuallySelected && !isDragging ? `translateY(${liftAmount}px) scale(1.05)` : 'translateY(0px)'}` };
                        
                        return ( 
                            <div key={card.id} className="pointer-events-auto select-none touch-none will-change-transform" 
                                    style={{ 
                                        position: 'absolute', bottom: 0, 
                                        // CENTERING FIX: Strictly position at 50% left minus half card width
                                        left: '50%', marginLeft: `-${cardWidthRem/2}rem`, 
                                        ...dragStyle, zIndex: zIndex, transformOrigin: 'bottom center', width: `${cardWidthRem}rem`, height: '8.5rem', 
                                        cursor: canInteract ? 'grab' : 'not-allowed', transition: isDragging ? 'none' : 'transform 0.15s ease-out' 
                                    }} 
                                    onMouseDown={(e) => handleStart(e.clientX, e.clientY, card.id)} 
                                    onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY, card.id)} 
                                    onMouseEnter={() => setHoveredCardId(card.id)} 
                                    onMouseLeave={() => setHoveredCardId(null)}
                            >
                                <div className="shadow-lg">
                                    <CardComponent 
                                        card={card} isHand isDisabled={false} isSelected={isVisuallySelected && !isDragging} 
                                        suitStatus={markers.isMature ? 'SAFE' : (markers.isForbidden ? 'FORBIDDEN' : 'NEUTRAL')} 
                                        isDraggable={canInteract} isSuggested={isHighlighted} 
                                        isSuspectedBaiLao={player.isSuspectedBaiLao} isBaiLao={false} isBanker={false} isFaceDown={false}
                                        className={`shadow-card-float ring-1 ring-white/10 ${isDragging ? 'scale-105' : ''}`} 
                                        onClick={() => handleLocalCardClick(card.id)} 
                                    />
                                </div>
                            </div> 
                        );
                    })}
                </div>
            </div>
        </div>
    );
});
