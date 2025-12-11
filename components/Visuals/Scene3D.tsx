
import React, { useMemo, useEffect, useState } from 'react';
import CardComponent from '../Card';
import { Card, Player, GamePhase, KaiChongDetail } from '../../types';
import { useSkin } from '../../contexts/SkinContext';
import { Compass } from './TableEffects';
import { CharacterFigure } from './CharacterFigure';
import { useGameSettings } from '../../hooks/useGameSettings';

// --- VISUAL COMPONENTS ---

const CinematicOverlay = React.memo(() => (
    <div className="absolute inset-0 pointer-events-none z-[2]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5 opacity-30 mix-blend-overlay"></div>
    </div>
));

const PingFeng = React.memo(({ skinId }: { skinId: string }) => {
    if (skinId === 'taoist_mystery') return null;
    return (
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[150%] h-[80%] z-[-5] opacity-30 pointer-events-none flex justify-center perspective-[1000px]" style={{ transform: 'translateZ(-600px)' }}>
             <div className="flex w-full h-full">
                {[...Array(6)].map((_, i) => (
                     <div key={i} className="flex-1 bg-gradient-to-b from-black to-transparent border-r border-white/5 relative overflow-hidden" 
                          style={{ transform: `rotateY(${i % 2 === 0 ? 10 : -10}deg)` }}>
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 mix-blend-overlay"></div>
                     </div>
                ))}
             </div>
        </div>
    );
});

// --- LAYOUT ENGINE CONFIGURATION ---
type LayoutMode = 'mobile_portrait' | 'mobile_landscape' | 'tablet_portrait' | 'tablet_landscape' | 'desktop';

const LAYOUT_CONFIGS = {
    // 1. MOBILE PORTRAIT: "THE STADIUM" - Widened & Closer
    mobile_portrait: {
        camera: { rotateX: 40, z: -220, perspective: '900px' },
        table: { width: '130vw', height: '140vh' }, // Wider table
        tableY: '52%',
        isVertical: true, 
        hidePaperDolls: true, 
        hidePingFeng: true,
        players: {
            Top: { top: '8%', left: '50%', scale: 0.9 }, 
            Left: { left: '5%', top: '40%', scale: 0.85 }, 
            Right: { right: '5%', top: '40%', scale: 0.85 },
            Bottom: { bottom: '90px', left: '50%', scale: 0.9 } 
        },
        cardScale: 0.85, 
        pot: { x: 160, y: -300, scale: 0.8 },
        tableCardSpread: { x: 90, y: 120 }, // Wider spread
        cardCenterOffset: { x: 0, y: 80 } 
    },
    // 2. MOBILE LANDSCAPE
    mobile_landscape: {
        camera: { rotateX: 30, z: -550, perspective: '900px' }, 
        table: { width: '70vw', height: '80vh' },
        tableY: '65%',
        isVertical: false,
        hidePaperDolls: false,
        hidePingFeng: false,
        players: {
            Top: { top: '-50%', left: '50%', scale: 0.5 }, 
            Left: { left: '-35%', top: '40%', scale: 0.5 },
            Right: { right: '-35%', top: '40%', scale: 0.5 },
            Bottom: { bottom: '10%', left: '50%', scale: 0.5 }
        },
        cardScale: 0.55,
        pot: { x: 280, y: -180, scale: 0.55 },
        tableCardSpread: { x: 45, y: 35 },
        cardCenterOffset: { x: 0, y: 0 }
    },
    // Desktop/Tablet configs remain similar but ensure consistency...
    tablet_portrait: {
        camera: { rotateX: 42, z: -700, perspective: '1100px' },
        table: { width: '95vw', height: '60vh' },
        tableY: '55%',
        isVertical: false, 
        hidePaperDolls: false,
        hidePingFeng: false,
        players: { Top: { top: '-40%', left: '50%', scale: 0.7 }, Left: { left: '-18%', top: '35%', scale: 0.65 }, Right: { right: '-18%', top: '35%', scale: 0.65 }, Bottom: { bottom: '15%', left: '50%', scale: 0.65 } },
        cardScale: 0.75, pot: { x: 300, y: -250, scale: 0.7 }, tableCardSpread: { x: 70, y: 70 }, cardCenterOffset: { x: 0, y: 0 }
    },
    tablet_landscape: {
        camera: { rotateX: 38, z: -500, perspective: '1200px' },
        table: { width: '75vw', height: '70vh' },
        tableY: '60%',
        isVertical: false, hidePaperDolls: false, hidePingFeng: false,
        players: { Top: { top: '-35%', left: '50%', scale: 0.8 }, Left: { left: '-22%', top: '35%', scale: 0.75 }, Right: { right: '-22%', top: '35%', scale: 0.75 }, Bottom: { bottom: '15%', left: '50%', scale: 0.75 } },
        cardScale: 0.8, pot: { x: 400, y: -280, scale: 0.75 }, tableCardSpread: { x: 80, y: 80 }, cardCenterOffset: { x: 0, y: 0 }
    },
    desktop: {
        camera: { rotateX: 35, z: -400, perspective: '1400px' }, 
        table: { width: '90vh', height: '85vh' },
        tableY: '60%',
        isVertical: false, hidePaperDolls: false, hidePingFeng: false,
        players: { Top: { top: '-32%', left: '50%', scale: 0.95 }, Left: { left: '-25%', top: '35%', scale: 0.9 }, Right: { right: '-25%', top: '35%', scale: 0.9 }, Bottom: { bottom: '15%', left: '50%', scale: 0.9 } },
        cardScale: 0.9, pot: { x: 500, y: -300, scale: 0.85 }, tableCardSpread: { x: 100, y: 100 }, cardCenterOffset: { x: 0, y: 0 }
    }
};

const useLayoutMode = (): LayoutMode => {
    const [mode, setMode] = useState<LayoutMode>('desktop');
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const aspect = w / h;
            if (w >= 1280 && aspect >= 1.2) return setMode('desktop');
            if (w >= 1024 && aspect < 1.2) return setMode('tablet_portrait'); 
            if (Math.min(w, h) >= 600) return setMode(aspect < 1 ? 'tablet_portrait' : 'tablet_landscape');
            return setMode(aspect < 1 ? 'mobile_portrait' : 'mobile_landscape');
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return mode;
};

const getDiaoStatusText = (player: Player) => {
    const trickCount = player.trickPile.filter(t => t.round <= 8 && !t.isKaiChong && t.isFaceUp).length;
    if (trickCount < 2) return "赤脚";
    if (trickCount === 2) return "正本";
    if (trickCount === 3) return "得吊";
    return "双吊";
};

const getPlayerGlow = (player: Player) => {
    const isBanker = player.isDealer;
    const isBai = player.isBaiLaoRevealed || player.isSuspectedBaiLao;
    if (isBanker && isBai) return { color: 'rgba(220, 38, 38, 0.8)', secondaryColor: 'rgba(16, 185, 129, 0.8)' };
    if (isBanker) return { color: 'rgba(220, 38, 38, 0.8)' };
    if (isBai) return { color: 'rgba(16, 185, 129, 0.8)' };
    return { color: 'rgba(245, 158, 11, 0.6)' }; 
};

// 3. Action Plate (Button) - REDESIGNED: Stadium Shape, Dark Crystal
const ActionPlate3D = React.memo(({ label, disabled, onClick, skin, isVertical }: { label: string, disabled: boolean, onClick: () => void, skin: any, isVertical?: boolean }) => {
    // Positioning logic
    const yPos = isVertical ? 240 : 320; 
    const zPos = 50;
    const rotateX = 15;

    // Dark Aesthetic Styles
    const containerClasses = `
        relative w-28 h-10 md:w-40 md:h-14 
        rounded-full 
        flex flex-col items-center justify-center 
        transition-all duration-500
    `;

    const buttonStyle = {
        background: disabled 
            ? 'linear-gradient(180deg, #1f1f1f, #0f0f0f)' 
            : 'linear-gradient(180deg, #3d0500, #1a0200)', // Deep Red/Black
        boxShadow: disabled 
            ? 'none'
            : 'inset 0 1px 1px rgba(255,255,255,0.1), 0 5px 15px rgba(0,0,0,0.8), 0 0 5px rgba(139, 0, 0, 0.3)',
        border: disabled ? '1px solid #333' : '1px solid #5c1010',
    };

    const textStyle = {
        fontFamily: '"Noto Serif SC", serif',
        color: disabled ? '#444' : '#e6c278', // Gold text
        textShadow: disabled ? 'none' : '0 1px 2px rgba(0,0,0,1)',
        letterSpacing: '0.2em',
        fontSize: '1rem',
        fontWeight: 'bold'
    };

    return (
        <div className="absolute z-[60]" onClick={onClick}
             style={{ 
                 transform: `translate3d(-50%, ${yPos}px, ${zPos}px) rotateX(${rotateX}deg)`, 
                 left: '50%', top: '50%',
                 transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                 pointerEvents: disabled ? 'none' : 'auto',
                 cursor: disabled ? 'default' : 'pointer',
                 filter: disabled ? 'grayscale(100%) opacity(0.5)' : 'none'
             }}>
            <div className={`${containerClasses} group ${!disabled ? 'active:scale-95 active:translate-y-1' : ''}`} style={buttonStyle}>
                
                {/* Shine effect */}
                {!disabled && <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-full pointer-events-none"></div>}
                
                {/* Text */}
                <div className="relative z-10">
                    <span style={textStyle}>{label}</span>
                </div>
                
                {/* Subtle Breathing Glow Border */}
                {!disabled && <div className="absolute -inset-[2px] rounded-full border border-[#8c1c0b]/50 animate-breathe-subtle opacity-50"></div>}
            </div>
        </div>
    );
});

// 4. Table Slab - Refined
const TableSlab = React.memo(({ skin, width, height, thickness = 40, children }: { skin: any, width: any, height: any, thickness?: number, children: React.ReactNode }) => {
    const borderStyle = { width: `${thickness}px`, height: `${thickness}px`, filter: 'brightness(0.15)' }; // Darker edges
    return (
        <div className="relative w-full h-full group" style={{ transformStyle: 'preserve-3d' }}>
            <div className={`absolute inset-0 z-0 overflow-hidden rounded-[inherit] ${skin.layout.tableSurfaceClass}`} 
                 style={{ ...skin.layout.tableSurfaceStyle, transform: `translateZ(${thickness / 2}px)`, transformStyle: 'preserve-3d' }}>
                 {/* Vignette & Grain */}
                 <div className="absolute inset-0 pointer-events-none z-[1] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.01)_0%,rgba(0,0,0,0.8)_90%)] mix-blend-multiply"></div>
                 <CinematicOverlay />
            </div>
            <div className="absolute inset-0 z-20 pointer-events-none" style={{ transform: `translateZ(${thickness / 2}px)`, transformStyle: 'preserve-3d' }}>
                {children}
            </div>
            {/* Sides */}
            <div className={`absolute bottom-0 left-0 w-full ${skin.layout.tableBorderClass}`} style={{ ...borderStyle, height: `${thickness}px`, width: '100%', transformOrigin: 'bottom', transform: `rotateX(-90deg) translateZ(0px) translateY(${thickness/2}px)` }}></div>
            <div className={`absolute top-0 right-0 h-full ${skin.layout.tableBorderClass}`} style={{ ...borderStyle, width: `${thickness}px`, height: '100%', transformOrigin: 'right', transform: `rotateY(-90deg) translateZ(0px) translateX(${thickness/2}px)` }}></div>
            <div className={`absolute top-0 left-0 h-full ${skin.layout.tableBorderClass}`} style={{ ...borderStyle, width: `${thickness}px`, height: '100%', transformOrigin: 'left', transform: `rotateY(90deg) translateZ(0px) translateX(-${thickness/2}px)` }}></div>
            <div className={`absolute top-0 left-0 w-full ${skin.layout.tableBorderClass}`} style={{ ...borderStyle, height: `${thickness}px`, width: '100%', transformOrigin: 'top', transform: `rotateX(90deg) translateZ(0px) translateY(-${thickness/2}px)` }}></div>
            
            {/* Ambient Shadow under table */}
            <div className="absolute inset-4 bg-black blur-[120px] opacity-100 rounded-[50%]" style={{ transform: `translateZ(-${thickness * 8}px) scale(0.8)` }}></div>
        </div>
    );
});

// (Keep CardStack3D, WonCardsGrid, PlayerZone3D, TableCards, PotStack mostly same, just ensure they pass props correctly)
// ... [Re-using existing implementations for brevity unless specific logic changes needed] ...
// Re-implementing PotStack to ensure spread logic is clear
const PotStack = React.memo(({ pot, mianZhang, phase, kaiChongCardIndex, layoutConfig }: any) => {
    const { x, y, scale } = layoutConfig.pot;
    const isKaiChong = phase === GamePhase.KAI_CHONG;
    const visiblePot = isKaiChong ? pot.slice(kaiChongCardIndex) : pot;
    
    return (
        <div style={{ position: 'absolute', left: '50%', top: '50%', transformStyle: 'preserve-3d', zIndex: 5 }}>
            {visiblePot.map((c: Card, i: number) => {
                let transform;
                if (isKaiChong) {
                    // CENTER SPREAD LOGIC
                    // Fan out horizontally in the center
                    const offsetX = (i - (visiblePot.length - 1) / 2) * 35 * scale;
                    // Move to center (0,0 relative to parent) instead of pot position (x,y)
                    transform = `translate(${offsetX}px, 0px) scale(${scale}) translateZ(${i * 2}px)`;
                } else {
                    const vertStackOffset = layoutConfig.isVertical ? i * 2 : i * 0.5;
                    transform = `translate(${x}px, ${y}px) scale(${scale}) translateZ(${vertStackOffset}px)`;
                }
                return (
                    <div key={c.id} className="absolute w-16 h-24 transition-all duration-700 ease-out" 
                         style={{ transform, boxShadow: '-1px 1px 4px rgba(0,0,0,0.8)' }}>
                        <CardComponent card={c} isFaceDown={true} isSmall={false} isInverted={true} />
                    </div>
                );
            })}
            {mianZhang && !isKaiChong && (
                <div className="absolute w-16 h-24" style={{ transform: `translate(${x}px, ${y}px) scale(${scale}) translateZ(${visiblePot.length*0.5}px)`, zIndex: 10 }}>
                     <CardComponent card={mianZhang} isFaceDown={false} isSmall={false} isInverted={true} />
                </div>
            )}
        </div>
    );
});

// CardStack3D, WonCardsGrid, PlayerZone3D, TableCards definitions remain same as previous best version...
// Placeholder re-declarations to avoid compilation errors if copying full file:
const CardStack3D = React.memo(({ cards, layout = 'horizontal', faceDown = false, baseRotation = 0, scale = 1, textRotation = 0 }: any) => {
    if (!cards || cards.length === 0) return null;
    const overlap = 20 * scale;
    const isHorz = layout === 'horizontal';
    return (
        <div style={{ position: 'relative', width: isHorz ? `${64*scale + (cards.length-1)*overlap}px` : `${64*scale}px`, height: isHorz ? `${96*scale}px` : `${96*scale + (cards.length-1)*overlap}px`, transformStyle: 'preserve-3d' }}>
            {cards.map((card: any, i: number) => (
                <div key={card.id} className="absolute w-16 h-24 transition-transform duration-500 ease-out"
                     style={{ top: isHorz ? 0 : i * overlap, left: isHorz ? i * overlap : 0, transform: `translate3d(0, 0, ${i * 0.5}px) rotateZ(${baseRotation}deg) scale(${scale})` }}>
                    <CardComponent card={card} isFaceDown={faceDown} isTrick={true} isSmall={false} textRotation={textRotation} className="shadow-[0_2px_5px_rgba(0,0,0,0.5)]"/>
                </div>
            ))}
        </div>
    );
});
const WonCardsGrid = React.memo(({ cards, baseRotation = 0, scale = 0.5, layout = 'horizontal', potCardIds, textRotation = 0, lanternGlow }: any) => {
    if (!cards || cards.length === 0) return null;
    const isVerticalFlow = layout === 'vertical-columns';
    const limit = isVerticalFlow ? 6 : (layout === 'vertical' ? 2 : 5);
    const gap = 14 * scale; const cw = 64 * scale; const ch = 96 * scale;
    return (
        <div style={{ position: 'relative', width: isVerticalFlow ? `${cw*2}px` : `${(cw+gap)*Math.min(cards.length,limit)}px`, height: isVerticalFlow ? `${ch*limit}px` : `${(ch+gap)*Math.ceil(cards.length/limit)}px`, transformStyle: 'preserve-3d' }}>
            {cards.map((card: any, i: number) => {
                let col, row;
                if (isVerticalFlow) { row = i % limit; col = Math.floor(i / limit); } else { col = i % limit; row = Math.floor(i / limit); }
                return (
                    <div key={card.id} className="absolute w-16 h-24 transition-transform duration-500"
                         style={{ left: col*(cw+gap), top: row*(ch+gap), transform: `translate3d(0, 0, ${i*0.2}px) rotateZ(${baseRotation}deg) scale(${scale})` }}>
                        <CardComponent card={card} isSmall={false} isTrick={true} isFaceDown={false} isInverted={card.isPot || potCardIds?.has(card.id)} textRotation={textRotation} className="shadow-sm border-black/40" lanternGlow={lanternGlow} />
                    </div>
                );
            })}
        </div>
    );
});
const PlayerZone3D = React.memo(({ player, position, isMyTurn, potCardIds, layoutConfig, quality }: any) => {
    const isHuman = player.type === 'HUMAN';
    const cfg = layoutConfig.players[position];
    if (!cfg) return null;
    let cardPos: any = { zIndex: 10 };
    let handRot = 0; let textRot = 0; let stackLayout = 'horizontal'; let zoneFlexDir = 'column';
    if (position === 'Top') { cardPos = { position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%) translateZ(15px)' }; handRot = 180; textRot = 180; stackLayout = 'horizontal'; zoneFlexDir = layoutConfig.isVertical ? 'row' : 'column'; } 
    else if (position === 'Left') { cardPos = { position: 'absolute', left: '2%', top: '50%', transform: 'translateY(-50%) translateZ(15px)' }; handRot = layoutConfig.isVertical ? 0 : 90; stackLayout = layoutConfig.isVertical ? 'vertical-columns' : 'horizontal'; zoneFlexDir = layoutConfig.isVertical ? 'column' : 'column'; } 
    else if (position === 'Right') { cardPos = { position: 'absolute', right: '2%', top: '50%', transform: 'translateY(-50%) translateZ(15px)' }; handRot = layoutConfig.isVertical ? 0 : -90; stackLayout = layoutConfig.isVertical ? 'vertical-columns' : 'horizontal'; zoneFlexDir = layoutConfig.isVertical ? 'column' : 'column'; } 
    else if (position === 'Bottom') { cardPos = { position: 'absolute', bottom: cfg.bottom || '150px', left: '50%', transform: 'translateX(-50%) translateZ(15px)' }; handRot = 0; textRot = 0; stackLayout = 'horizontal'; zoneFlexDir = 'column'; }
    const charStyle: any = { position: 'absolute', top: cfg.top, left: cfg.left, right: cfg.right, bottom: cfg.bottom, transform: `translate(${position==='Top' || position==='Left' ? '-50%' : '50%'}, -50%) rotateX(-45deg) rotateY(${position==='Top'?180:(position==='Left'?-20:20)}deg) scale(${cfg.scale})`, zIndex: 0 };
    if (layoutConfig.isVertical && (position === 'Left' || position === 'Right')) { charStyle.transform = `translateY(-50%) rotateX(-45deg) rotateY(${position==='Left' ? -15 : 15}deg) scale(${cfg.scale})`; }
    const lanternGlow = getPlayerGlow(player);
    return (
        <div className="absolute inset-0 pointer-events-none z-[20]" style={{ transformStyle: 'preserve-3d' }}>
            {!isHuman && !layoutConfig.hidePaperDolls && (
                <div style={charStyle} className="pointer-events-auto origin-bottom"><CharacterFigure player={player} position={position} isActive={isMyTurn} isBanker={player.isDealer} isBaiLao={player.isBaiLaoRevealed} statusText={getDiaoStatusText(player)} /></div>
            )}
            <div style={cardPos} className="pointer-events-auto">
                <div style={{ display: 'flex', flexDirection: zoneFlexDir as any, gap: '15px', alignItems: 'center', justifyContent: 'center' }}>
                    {!isHuman && <CardStack3D cards={player.hand} layout={stackLayout === 'vertical-columns' ? 'vertical' : stackLayout} faceDown={true} baseRotation={handRot} textRotation={textRot} scale={layoutConfig.cardScale}/>}
                    {player.capturedCards?.length > 0 && (
                        <div style={{ opacity: 0.95 }}><WonCardsGrid cards={player.capturedCards} baseRotation={handRot} textRotation={textRot} scale={layoutConfig.cardScale * 0.85} layout={stackLayout} potCardIds={potCardIds} lanternGlow={lanternGlow} /></div>
                    )}
                </div>
            </div>
        </div>
    );
});
const TableCards = React.memo(({ cards, winnerId, layoutConfig, players }: any) => {
    if (!cards || cards.length === 0) return null;
    const { x, y } = layoutConfig.tableCardSpread;
    const isVert = layoutConfig.isVertical;
    const centerOffset = layoutConfig.cardCenterOffset || { x: 0, y: 0 }; 
    return (
        <div className="absolute inset-0 pointer-events-none z-[40]" style={{ transformStyle: 'preserve-3d' }}>
            {cards.map((entry: any, i: number) => {
                const { playerId } = entry;
                let tx = 0, ty = 0, rot = 0;
                if (playerId === 0) { ty = y; rot = 0; } else if (playerId === 1) { tx = x; rot = isVert ? 0 : -90; } else if (playerId === 2) { ty = -y; rot = 180; } else if (playerId === 3) { tx = -x; rot = isVert ? 0 : 90; }
                tx += centerOffset.x; ty += centerOffset.y;
                let textRot = 0; if (playerId === 2) textRot = 180;
                const isWinner = winnerId === playerId;
                const zVal = (isWinner ? 60 : i * 2) + (isVert ? 90 : 0);
                let lanternGlow = null;
                if (isWinner) { const winnerPlayer = players.find((p: Player) => p.id === winnerId); if (winnerPlayer) { lanternGlow = getPlayerGlow(winnerPlayer); } }
                return (
                    <div key={entry.card.id} className="absolute top-1/2 left-1/2 w-16 h-24 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)"
                         style={{ transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${layoutConfig.cardScale}) translateZ(${zVal}px)`, zIndex: isWinner ? 100 : i }}>
                        <CardComponent card={entry.card} isFaceDown={entry.isFaceDown} isTrick={true} isWinner={isWinner} textRotation={textRot} isInverted={entry.card.isPot} lanternGlow={lanternGlow} className={isWinner ? "shadow-xl" : "shadow-2xl"} />
                    </div>
                );
            })}
        </div>
    );
});

// --- MAIN SCENE EXPORT ---
export const Scene3D = React.memo(({ state, interactionState }: any) => {
    const { skin } = useSkin();
    const mode = useLayoutMode();
    const layoutConfig = LAYOUT_CONFIGS[mode]; 
    const { graphicsQuality } = useGameSettings();
    const { phase, currentPlayerIndex, trickWinnerId, tableCards, players, bankerId, pot, mianZhangCard, gameMessage, violationNotification, kaiChongCardIndex, kaiChongHistory } = state;
    const playedPlayerIds = useMemo(() => tableCards ? tableCards.map((tc: any) => tc.playerId) : [], [tableCards]);
    
    // UPDATED: WIDER ASPECT FOR MOBILE PORTRAIT
    const compassAspect = layoutConfig.isVertical ? 'aspect-[2/1]' : 'aspect-[2/1]';

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden select-none bg-[#020101]">
            <skin.layout.atmosphereComponent quality={graphicsQuality} />
            <div className="w-full h-full perspective-container" style={{ perspective: layoutConfig.camera.perspective }}>
                <div className="world-3d w-full h-full relative preserve-3d transition-transform duration-1000 ease-out"
                     style={{ transform: `rotateX(${layoutConfig.camera.rotateX}deg) translateY(-50%) translateZ(${layoutConfig.camera.z}px)` }}>
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 preserve-3d transition-all duration-1000"
                        style={{ top: layoutConfig.tableY, width: layoutConfig.table.width, height: layoutConfig.table.height }}>
                        {!layoutConfig.hidePingFeng && <PingFeng skinId={skin.id} />}
                        <TableSlab skin={skin} width={layoutConfig.table.width} height={layoutConfig.table.height}>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[10]" style={{ transform: 'translateZ(1px)' }}>
                                <div className={`w-[95%] max-w-[800px] ${compassAspect} relative opacity-90 transition-all duration-700`}>
                                    <Compass activePlayerId={currentPlayerIndex} bankerId={bankerId} revealedBaiLaoId={players.find((p:any)=>p.isBaiLaoRevealed)?.id??null} suspectedBaiLaoId={players.find((p:any)=>p.isSuspectedBaiLao)?.id??null} hasTableCards={tableCards?.length>0} playedPlayerIds={playedPlayerIds} phase={phase} isVertical={layoutConfig.isVertical}/>
                                    <skin.lighting.TableBorderFlow activePlayerId={currentPlayerIndex} isVertical={layoutConfig.isVertical} />
                                </div>
                            </div>
                            {phase !== GamePhase.DEALING && (
                                <>
                                    {players.map((p: Player) => {
                                        const myKc = kaiChongHistory.filter((h:any) => h.playerId === p.id);
                                        const potIds = new Set(myKc.map((m:any) => m.matchedCard.id));
                                        return <PlayerZone3D key={p.id} player={p} position={p.position} isMyTurn={currentPlayerIndex === p.id} potCardIds={potIds} layoutConfig={layoutConfig} quality={graphicsQuality} />;
                                    })}
                                    <PotStack pot={pot} mianZhang={mianZhangCard} phase={phase} kaiChongCardIndex={kaiChongCardIndex} layoutConfig={layoutConfig}/>
                                    <TableCards cards={tableCards} winnerId={trickWinnerId} layoutConfig={layoutConfig} players={players} />
                                </>
                            )}
                            <skin.lighting.StoveLighting activePlayerId={currentPlayerIndex} spotlightPos={phase === GamePhase.KAI_CHONG ? { x: `${50 + (kaiChongCardIndex - 3) * 8}%`, y: '50%' } : null} />
                            
                            {/* ACTION BUTTON */}
                            {interactionState && <ActionPlate3D label={interactionState.label} disabled={interactionState.disabled} onClick={interactionState.onActionClick} skin={skin} isVertical={layoutConfig.isVertical} />}

                            {gameMessage && (
                                <div className="absolute top-[32%] left-1/2 z-[1000] flex items-center justify-center pointer-events-none" style={{ transform: 'translate(-50%, -50%) translateZ(120px) rotateX(-45deg)', width: '100%', textAlign: 'center' }}>
                                    <div className="text-[#e6c278] font-calligraphy text-3xl md:text-4xl drop-shadow-[0_5px_15px_rgba(0,0,0,1)] bg-[#0f0a08]/90 px-10 py-4 rounded-sm border-y-2 border-[#8c6239] backdrop-blur-xl animate-fade-in-up tracking-[0.3em] shadow-lg">{gameMessage}</div>
                                </div>
                            )}
                            {violationNotification && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200]" style={{ transform: 'translateZ(200px) rotateX(-45deg)' }}>
                                     <div className="bg-[#1a0505]/95 border-4 border-[#8c1c0b] p-10 text-center shadow-[0_0_150px_rgba(255,0,0,0.6)] rounded-sm animate-shake backdrop-blur-md">
                                         <h3 className="text-4xl text-[#ff4d4d] font-bold uppercase mb-4 tracking-[0.3em] drop-shadow-md">{violationNotification.title}</h3>
                                         <p className="text-[#e8e4d9] text-xl font-serif leading-relaxed">{violationNotification.message}</p>
                                     </div>
                                </div>
                            )}
                        </TableSlab>
                    </div>
                </div>
            </div>
        </div>
    );
});
