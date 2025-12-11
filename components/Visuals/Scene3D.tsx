
import React, { useMemo, useEffect, useState } from 'react';
import CardComponent from '../Card';
import { Card, Player, GamePhase, KaiChongDetail } from '../../types';
import { useSkin } from '../../contexts/SkinContext';
import { Compass } from './TableEffects';
import { CharacterFigure } from './CharacterFigure';

// --- LAYOUT ENGINE TYPES ---
type LayoutMode = 'mobile_portrait' | 'mobile_landscape' | 'tablet_portrait' | 'tablet_landscape' | 'desktop';

// Define layout parameters for different devices
const LAYOUT_CONFIGS = {
    // 1. MOBILE PORTRAIT: Focused Stadium View
    mobile_portrait: {
        camera: { rotateX: 42, z: -200, perspective: '1200px' },
        table: { width: '110vw', height: '130vh' },
        tableY: '55%', 
        isVertical: true, 
        hidePaperDolls: true,
        hidePingFeng: true,
        players: {
            Top: { top: '2%', left: '50%', scale: 0.6 }, 
            Left: { left: '1%', top: '25%', scale: 0.6 }, 
            Right: { right: '1%', top: '25%', scale: 0.6 }
        },
        cardScale: 0.7, 
        pot: { x: 140, y: -260, scale: 0.65 }, 
        // CRITICAL FIX: Tighter X spread (65) to stay within vertical stadium
        tableCardSpread: { x: 65, y: 100 } 
    },
    // 2. DESKTOP / LANDSCAPE
    desktop: {
        camera: { rotateX: 38, z: -550, perspective: '1200px' }, 
        table: { width: '80vh', height: '80vh' },
        tableY: '60%',
        isVertical: false,
        hidePaperDolls: false,
        hidePingFeng: false,
        players: {
            Top: { top: '-35%', left: '50%', scale: 0.95 },
            Left: { left: '-22%', top: '40%', scale: 0.9 }, 
            Right: { right: '-22%', top: '40%', scale: 0.9 }
        },
        cardScale: 0.9,
        pot: { x: 500, y: -320, scale: 0.8 },
        tableCardSpread: { x: 110, y: 110 }
    }
};

const useLayoutMode = (): LayoutMode => {
    const [mode, setMode] = useState<LayoutMode>('desktop');
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            if (w < h) setMode('mobile_portrait');
            else setMode('desktop'); // Simplified for robustness
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return mode;
};

// --- SUB-COMPONENTS ---

const CinematicOverlay = React.memo(() => (
    <div className="absolute inset-0 pointer-events-none z-[5]" style={{ transformStyle: 'preserve-3d' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,transparent_20%,#000000_95%)] mix-blend-multiply opacity-90"></div>
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay"></div>
    </div>
));

const TableCards = React.memo(({ cards, winnerId, skin, layoutConfig }: any) => {
    if (!cards || cards.length === 0) return null;
    const { x: spreadX, y: spreadY } = layoutConfig.tableCardSpread;
    const isVertical = layoutConfig.isVertical;
    // Shift down in vertical mode so cards don't cover the top player info
    const verticalCenterOffset = isVertical ? 60 : 0; 

    return (
        <div className="absolute inset-0 pointer-events-none z-[40]" style={{ transformStyle: 'preserve-3d' }}>
            {cards.map((entry: any, i: number) => {
                const { playerId, card, isFaceDown } = entry;
                let tx = 0, ty = 0, rot = 0;
                
                // Position logic based on player ID relative to table center
                switch (playerId) {
                    case 0: ty = spreadY; rot = 0; break;
                    case 1: tx = spreadX; rot = -90; break; 
                    case 2: ty = -spreadY; rot = 180; break;
                    case 3: tx = -spreadX; rot = 90; break;
                }

                if (isVertical) rot = 0; // Force upright cards in vertical mode for readability

                const isWinner = winnerId === playerId;
                // Boost Z significantly to avoid clipping into table
                const zVal = (isWinner ? 80 : 30 + i * 2);

                return (
                    <div key={card.id} 
                         className="absolute top-1/2 left-1/2 w-16 h-24 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)"
                         style={{
                             transform: `translate(-50%, -50%) translate(${tx}px, ${ty + verticalCenterOffset}px) rotate(${rot}deg) scale(${isWinner ? 1.2 : 1}) translateZ(${zVal}px)`,
                             zIndex: isWinner ? 100 : i
                         }}
                    >
                        <CardComponent 
                            card={card} 
                            isFaceDown={isFaceDown} 
                            isTrick={true} 
                            isWinner={isWinner}
                            className={isWinner ? "shadow-[0_0_30px_rgba(255,215,0,0.6)]" : "shadow-xl"}
                        />
                    </div>
                );
            })}
        </div>
    );
});

const PlayerZones3D = React.memo(({ players, currentPlayerIndex, kaiChongHistory, layoutConfig, quality }: any) => {
    return (
        <>
            {players.map((p: Player) => {
                if (p.position === 'Bottom') return null;

                const isHuman = p.type === 'HUMAN';
                const { scale: cardScale } = layoutConfig;
                const cfg = layoutConfig.players[p.position as 'Top' | 'Left' | 'Right'];
                
                // Calculate won cards
                const myKcMatches = kaiChongHistory.filter((h: any) => h.playerId === p.id);
                const potCardIds = new Set(myKcMatches.map((m: any) => m.matchedCard.id));
                const wonCards = p.capturedCards || [];

                // Positioning Logic
                let zoneStyle: React.CSSProperties = { position: 'absolute', zIndex: 20 };
                
                if (p.position === 'Top') zoneStyle = { ...zoneStyle, top: '15%', left: '50%', transform: 'translateX(-50%) translateZ(15px)' };
                else if (p.position === 'Left') zoneStyle = { ...zoneStyle, left: '2%', top: '50%', transform: 'translateY(-50%) translateZ(15px)' };
                else if (p.position === 'Right') zoneStyle = { ...zoneStyle, right: '2%', top: '50%', transform: 'translateY(-50%) translateZ(15px)' };
                else zoneStyle = { display: 'none' }; // Bottom (Human) handled by HUD

                if (isHuman) return null;

                // Simple Visual Representation for Opponents
                return (
                    <div key={p.id} style={zoneStyle} className="pointer-events-auto">
                        <div className="flex flex-col items-center gap-2" style={{ transformStyle: 'preserve-3d' }}>
                            {/* Avatar/Character */}
                            {!layoutConfig.hidePaperDolls && (
                                <div style={{ transform: `scale(${cfg.scale})` }}>
                                    <CharacterFigure 
                                        player={p} position={p.position} isActive={currentPlayerIndex === p.id} 
                                        isBanker={p.isDealer} isBaiLao={!!p.isBaiLaoRevealed} statusText=""
                                        quality={quality}
                                    />
                                </div>
                            )}
                            
                            {/* Hand Backs */}
                            <div className="flex -space-x-12" style={{ transform: `scale(${cardScale})` }}>
                                {p.hand.map((c, i) => (
                                    <div key={i} className="w-16 h-24 relative shadow-md">
                                        <CardComponent card={c} isFaceDown isSmall={false} isTrick />
                                    </div>
                                ))}
                            </div>

                            {/* Won Pile Tiny Preview */}
                            {wonCards.length > 0 && (
                                <div className="absolute top-full mt-2 grid grid-cols-5 gap-1 w-32 opacity-80" style={{ transform: 'scale(0.5)' }}>
                                    {wonCards.map((c: Card) => (
                                        <div key={c.id} className="w-16 h-24 relative">
                                            <CardComponent card={c} isSmall isInverted={potCardIds.has(c.id)} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </>
    );
});

// --- MAIN SCENE ---

export const Scene3D = React.memo(({ state, interactionState, graphicsQuality = 'HIGH' }: any) => {
    const { skin } = useSkin();
    const mode = useLayoutMode();
    const layoutConfig = (LAYOUT_CONFIGS as any)[mode] || LAYOUT_CONFIGS.desktop;

    const { 
        phase, currentPlayerIndex, trickWinnerId, tableCards, players, bankerId, 
        pot, mianZhangCard, gameMessage, violationNotification, kaiChongCardIndex, kaiChongHistory
    } = state;

    const playedPlayerIds = useMemo(() => {
        if (!tableCards) return [];
        return tableCards.map((tc: any) => tc.playerId);
    }, [tableCards]);

    // Dynamic Compass Aspect Ratio: Taller for Mobile Portrait
    const compassAspect = layoutConfig.isVertical ? 'aspect-[2/3]' : 'aspect-[1.8/1]';

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden select-none bg-[#050202]">
            <skin.layout.atmosphereComponent quality={graphicsQuality} />

            <div className="w-full h-full perspective-container" style={{ perspective: layoutConfig.camera.perspective }}>
                <div className="world-3d w-full h-full relative preserve-3d transition-transform duration-1000 ease-out"
                     style={{ 
                         transform: `rotateX(${layoutConfig.camera.rotateX}deg) translateY(-50%) translateZ(${layoutConfig.camera.z}px)`, 
                     }}>
                    
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 preserve-3d transition-all duration-1000"
                        style={{
                            top: layoutConfig.tableY,
                            width: layoutConfig.table.width,
                            height: layoutConfig.table.height,
                        }}
                    >
                        {/* Table Slab */}
                        <div className={`absolute inset-0 z-0 overflow-hidden rounded-[inherit] ${skin.layout.tableSurfaceClass}`} 
                             style={{ ...skin.layout.tableSurfaceStyle, transform: `translateZ(20px)`, transformStyle: 'preserve-3d' }}>
                             <CinematicOverlay />
                        </div>

                        {/* Compass Layer */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[10]" style={{ transform: 'translateZ(25px)' }}>
                            <div className={`w-[95%] max-w-[1000px] ${compassAspect} relative opacity-90 transition-all duration-700`}>
                                <Compass 
                                    activePlayerId={currentPlayerIndex} 
                                    bankerId={bankerId} 
                                    revealedBaiLaoId={players.find((p: Player) => p.isBaiLaoRevealed)?.id ?? null}
                                    suspectedBaiLaoId={players.find((p: Player) => p.isSuspectedBaiLao)?.id ?? null}
                                    playedPlayerIds={playedPlayerIds}
                                    phase={phase} 
                                    isVertical={layoutConfig.isVertical}
                                />
                                <skin.lighting.TableBorderFlow activePlayerId={currentPlayerIndex} isVertical={layoutConfig.isVertical} />
                            </div>
                        </div>

                        {/* Game Elements */}
                        {phase !== GamePhase.DEALING && (
                            <>
                                <PlayerZones3D 
                                    players={players} 
                                    currentPlayerIndex={currentPlayerIndex} 
                                    kaiChongHistory={kaiChongHistory || []} 
                                    layoutConfig={layoutConfig} 
                                    quality={graphicsQuality} 
                                />
                                
                                {/* Pot Stack */}
                                {phase !== GamePhase.DEALING && (
                                    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(${layoutConfig.pot.x}px, ${layoutConfig.pot.y}px) scale(${layoutConfig.pot.scale})`, transformStyle: 'preserve-3d', zIndex: 5 }}>
                                        {pot.slice(kaiChongCardIndex).map((c: Card, i: number) => (
                                            <div key={c.id} className="absolute w-16 h-24" style={{ transform: `translateZ(${i * 0.5}px) ${layoutConfig.isVertical && phase === GamePhase.KAI_CHONG ? `translateY(${i * 20}px)` : ''}`, boxShadow: '-1px 1px 2px rgba(0,0,0,0.5)' }}>
                                                <CardComponent card={c} isFaceDown isSmall={false} isTrick={false} />
                                            </div>
                                        ))}
                                        {mianZhangCard && phase === GamePhase.PLAYING && (
                                            <div className="absolute w-16 h-24" style={{ transform: `translateZ(${pot.length * 0.5}px)`, zIndex: 10 }}>
                                                <CardComponent card={mianZhangCard} isFaceDown={false} isSmall={false} isTrick={false} className="brightness-90" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <TableCards cards={tableCards} winnerId={trickWinnerId} skin={skin} layoutConfig={layoutConfig} />
                            </>
                        )}

                        {/* Messages */}
                        {gameMessage && (
                            <div className="absolute top-[32%] left-1/2 z-[1000] flex items-center justify-center pointer-events-none"
                                 style={{ transform: 'translate(-50%, -50%) translateZ(150px) rotateX(-45deg)' }}>
                                <div className="text-[#c5a059] font-calligraphy text-2xl md:text-3xl bg-black/70 px-8 py-3 rounded-sm border-y-2 border-imperial-gold backdrop-blur-xl shadow-lacquer-deep">
                                    {gameMessage}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});
