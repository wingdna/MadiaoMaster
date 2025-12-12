
import React, { useMemo, useEffect, useState } from 'react';
import CardComponent from '../Card';
import { Card, Player, GamePhase, KaiChongDetail, CardColor, CardRank } from '../../types';
import { useSkin } from '../../contexts/SkinContext';
import { Compass } from './TableEffects';
import { CharacterFigure } from './CharacterFigure';
import { useGameSettings } from '../../hooks/useGameSettings';

// --- VISUAL COMPONENTS ---

const CinematicOverlay = React.memo(() => (
    <div className="absolute inset-0 pointer-events-none z-[100]">
        {/* Dust Motes / Air Particles */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
        {/* Vignette for Privacy/Focus */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]"></div>
        {/* Subtle Warm Bloom */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-500/5 blur-[100px] mix-blend-screen pointer-events-none"></div>
    </div>
));

// V16: Ambient Wall Screen (Background Only)
const TopPaperScreen = React.memo(({ skinId }: { skinId: string }) => {
    // V19 Update: User requested "Candlelight Warmth" for the screen background regardless of skin
    const lightColor = 'rgba(255, 160, 100, 0.5)'; // Deep warm candle orange

    return (
        <div className="absolute top-0 inset-x-0 h-[50vh] pointer-events-none z-[0] overflow-hidden"
             style={{ 
                 // Fade out the wall as it gets closer to the table (bottom)
                 maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                 WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
             }}>
            
            {/* 1. The Light Source (Behind the paper) */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[120%] blur-[60px] opacity-60"
                 style={{ background: `radial-gradient(circle, ${lightColor} 0%, transparent 70%)` }}>
            </div>

            {/* 2. Paper Texture (The Wall Itself) */}
            <div className="absolute inset-0 opacity-20 mix-blend-overlay" 
                 style={{ 
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                     backgroundSize: '200px 200px'
                 }}>
            </div>

            {/* 3. Shadow Play (Bamboo/Trees outside) - Projected onto the wall */}
            <div className="absolute inset-0 opacity-30 mix-blend-multiply filter blur-[4px]">
                 <div className="absolute top-0 right-[10%] w-[4px] h-full bg-black transform rotate-12"></div>
                 <div className="absolute top-[10%] right-[10%] w-[60px] h-[2px] bg-black transform rotate-12"></div>
                 <div className="absolute top-[30%] right-[8%] w-[40px] h-[2px] bg-black transform rotate-45"></div>
                 
                 <div className="absolute top-[-10%] left-[15%] w-[6px] h-full bg-black transform -rotate-6"></div>
                 <div className="absolute top-[20%] left-[12%] w-[80px] h-[3px] bg-black transform -rotate-12"></div>
            </div>

            {/* 4. Lattice Grid (The Screen Frame) - Subtle structural hint */}
            <div className="absolute inset-0 opacity-10 mix-blend-multiply" 
                 style={{ 
                     backgroundImage: `
                        linear-gradient(90deg, #000 1px, transparent 1px), 
                        linear-gradient(180deg, #000 1px, transparent 1px)
                     `,
                     backgroundSize: '60px 100px',
                     transform: 'perspective(500px) rotateX(10deg) scale(1.1)' // Slight perspective to match room
                 }}>
            </div>
        </div>
    );
});

const PingFeng = React.memo(({ skinId }: { skinId: string }) => {
    if (skinId === 'taoist_mystery') return null;
    return (
        <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[180%] h-[90%] z-[-10] opacity-30 pointer-events-none flex justify-center perspective-[1000px]" style={{ transform: 'translateZ(-800px)', transformStyle: 'preserve-3d' }}>
             <div className="flex w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                {[...Array(6)].map((_, i) => (
                     <div key={i} className="flex-1 bg-gradient-to-b from-black to-transparent border-r border-white/5 relative overflow-hidden origin-bottom" 
                          style={{ transform: `rotateY(${i % 2 === 0 ? 15 : -15}deg) scale(1.1)` }}>
                         <div className="absolute inset-0 opacity-20" 
                              style={{ 
                                  backgroundImage: 'linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.05) 50%, transparent 55%)',
                                  backgroundSize: '10px 10px' 
                              }}>
                         </div>
                     </div>
                ))}
             </div>
        </div>
    );
});

// --- LAYOUT ENGINE CONFIGURATION ---
type LayoutMode = 'mobile_portrait' | 'mobile_landscape' | 'tablet_portrait' | 'tablet_landscape' | 'desktop';

const DESKTOP_CONFIG = {
    camera: { rotateX: 40, z: -350, perspective: '1400px' }, 
    table: { width: '130vh', height: '85vh' },
    tableY: '55%', 
    isVertical: false, 
    hidePaperDolls: false, 
    hidePingFeng: false,
    players: { 
        Top: { top: '-38%', left: '50%', scale: 0.8 }, 
        Left: { left: '-32%', top: '0%', scale: 0.8 }, 
        Right: { right: '-32%', top: '0%', scale: 0.8 }, 
        Bottom: { bottom: '10%', left: '50%', scale: 1.0 } 
    },
    cardScale: 1.3, 
    pot: { x: 500, y: -280, scale: 0.8 }, 
    tableCardSpread: { x: 180, y: 120 }, 
    cardCenterOffset: { x: 0, y: 30 } 
};

const LAYOUT_CONFIGS: Record<LayoutMode, any> = {
    mobile_portrait: {
        camera: { rotateX: 35, z: -50, perspective: '1000px' }, 
        table: { width: '96vw', height: '135vh' },
        tableY: '81%', 
        isVertical: true, 
        hidePaperDolls: true, 
        hidePingFeng: true,
        players: {
            Top: { top: '5%', left: '50%', scale: 0.7 },
            Left: { left: '2%', top: '28%', scale: 0.7 }, 
            Right: { right: '2%', top: '28%', scale: 0.7 }, 
            Bottom: { bottom: '0%', left: '50%', scale: 0.9 } 
        },
        cardScale: 0.95, 
        pot: { x: -120, y: -260, scale: 0.9 }, 
        tableCardSpread: { x: 45, y: 115 }, 
        cardCenterOffset: { x: 0, y: 0 } 
    },
    mobile_landscape: {
        camera: { rotateX: 35, z: -380, perspective: '1100px' }, 
        table: { width: '110vw', height: '80vh' },
        tableY: '58%',
        isVertical: false, 
        hidePaperDolls: false, 
        hidePingFeng: true,
        players: {
            Top: { top: '-45%', left: '50%', scale: 0.65 }, 
            Left: { left: '-35%', top: '0%', scale: 0.65 }, 
            Right: { right: '-35%', top: '0%', scale: 0.65 },
            Bottom: { bottom: '5%', left: '50%', scale: 0.65 }
        },
        cardScale: 1.0,
        pot: { x: 350, y: -180, scale: 0.65 }, 
        tableCardSpread: { x: 130, y: 80 },
        cardCenterOffset: { x: 0, y: 10 }
    },
    tablet_portrait: {
        camera: { rotateX: 45, z: -600, perspective: '1200px' }, 
        table: { width: '90vw', height: '70vh' },
        tableY: '45%',
        isVertical: false, 
        hidePaperDolls: false, 
        hidePingFeng: false,
        players: { 
            Top: { top: '-45%', left: '50%', scale: 0.8 }, 
            Left: { left: '-25%', top: '0%', scale: 0.75 }, 
            Right: { right: '-25%', top: '0%', scale: 0.75 }, 
            Bottom: { bottom: '10%', left: '50%', scale: 0.75 } 
        },
        cardScale: 1.1, 
        pot: { x: 320, y: -240, scale: 0.75 }, 
        tableCardSpread: { x: 140, y: 100 }, 
        cardCenterOffset: { x: 0, y: 20 }
    },
    desktop: DESKTOP_CONFIG,
    tablet_landscape: DESKTOP_CONFIG
};

const useLayoutMode = (): LayoutMode => {
    const [mode, setMode] = useState<LayoutMode>('desktop');
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const aspect = w / h;
            if (w >= 1024 && aspect >= 1.3) return setMode('desktop'); 
            if (Math.min(w, h) >= 600) return setMode(aspect < 1 ? 'tablet_portrait' : 'tablet_landscape'); 
            return setMode(aspect < 1 ? 'mobile_portrait' : 'mobile_landscape');
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return mode;
};

const ActionPlate3D = React.memo(({ label, disabled, onClick, skin, isVertical }: { label: string, disabled: boolean, onClick: () => void, skin: any, isVertical?: boolean }) => {
    const [pressed, setPressed] = useState(false);
    const yPos = isVertical ? 350 : 320; 
    const zPos = 150; 
    let artifactColor = '#1a0b05';
    let artifactBorder = '#d4af37';
    let artifactText = '#ffdb7a';
    if (skin.id === 'ming_scholar') { artifactColor = '#3d2616'; artifactBorder = '#5c3a21'; artifactText = '#d9c7b0'; }
    
    const handleClick = () => { if (disabled) return; setPressed(true); onClick(); setTimeout(() => setPressed(false), 200); };
    if (disabled) return null;
    return (
        <div className="absolute z-[60]" onClick={handleClick} style={{ transform: `translate3d(-50%, ${yPos}px, ${zPos}px) rotateX(20deg)`, left: '50%', top: '50%', transformStyle: 'preserve-3d', cursor: 'pointer', pointerEvents: 'auto', transition: 'opacity 0.3s' }}>
            <div className={`relative w-40 h-16 transition-transform duration-100 ease-out ${pressed ? 'translate-y-2' : 'animate-float-slow'}`} style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 flex items-center justify-center rounded-[4px] transition-all duration-300" 
                     style={{ 
                         background: `linear-gradient(135deg, ${artifactColor}, #050202)`, 
                         border: `1px solid ${artifactBorder}`, 
                         boxShadow: '0 10px 30px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.1)', 
                         transform: 'translateZ(10px)' 
                     }}>
                    <span className="font-calligraphy text-2xl tracking-[0.4em] select-none drop-shadow-[0_2px_0_rgba(0,0,0,1)]" style={{ color: artifactText }}>{label}</span>
                    {/* Gloss Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none rounded-[3px]"></div>
                </div>
                {/* 3D Sides */}
                <div className="absolute top-0 left-0 w-full h-[15px] origin-top bg-black/80" style={{ transform: 'rotateX(-90deg)' }}></div>
                <div className="absolute bottom-0 left-0 w-full h-[15px] origin-bottom" style={{ background: '#000', transform: 'rotateX(90deg)' }}></div>
                <div className="absolute top-0 left-0 w-[15px] h-full origin-left bg-black/90" style={{ transform: 'rotateY(90deg)' }}></div>
                <div className="absolute top-0 right-0 w-[15px] h-full origin-right bg-black/90" style={{ transform: 'rotateY(-90deg)' }}></div>
            </div>
        </div>
    );
});

// --- ENHANCED TABLE SLAB ---
const TableSlab = React.memo(({ skin, width, height, thickness = 40, visualYOffset = '0px', children }: any) => {
    const borderStyle = { filter: 'brightness(0.15)' }; 
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <div className="relative w-full h-full group" style={{ transformStyle: 'preserve-3d' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ transform: `translateY(${visualYOffset})`, transformStyle: 'preserve-3d' }}>
                <div className={`absolute inset-0 z-0 ${skin.layout.tableSurfaceClass}`} 
                     style={{ 
                         transform: `translateZ(${thickness / 2}px)`, 
                         transformStyle: isMobile ? 'flat' : 'preserve-3d' 
                     }}>
                     <div className="absolute inset-0 w-full h-full rounded-[inherit]" 
                          style={{ backgroundColor: skin.layout.tableBaseColor || '#1a1a1a' }}>
                     </div>
                     <div className="absolute inset-0 w-full h-full rounded-[inherit] mix-blend-normal" 
                          style={{ 
                              backgroundImage: skin.layout.tableTexture || 'none',
                              backgroundSize: skin.layout.tableTextureSize || 'auto',
                              opacity: 1.0 
                          }}>
                     </div>
                     {skin.layout.tableReflectivity && (
                         <div className="absolute inset-0 w-full h-full rounded-[inherit] mix-blend-overlay opacity-40 pointer-events-none"
                              style={{
                                  background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.05) 50%, transparent 60%)',
                                  filter: 'blur(10px)'
                              }}>
                         </div>
                     )}
                     <div className="absolute inset-0 w-full h-full rounded-[inherit] pointer-events-none mix-blend-multiply bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]"></div>
                     <div className="absolute inset-0 w-full h-full rounded-[inherit] pointer-events-none border border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
                </div>
                <div className={`absolute bottom-0 left-0 w-full h-[${thickness}px] ${skin.layout.tableBorderClass}`} style={{ ...borderStyle, height: thickness, transformOrigin: 'bottom', transform: `rotateX(-90deg) translateZ(0px)` }}></div>
                <div className={`absolute top-0 right-0 h-full w-[${thickness}px] ${skin.layout.tableBorderClass}`} style={{ ...borderStyle, width: thickness, transformOrigin: 'right', transform: `rotateY(90deg) translateZ(0px)` }}></div>
                <div className={`absolute top-0 left-0 h-full w-[${thickness}px] ${skin.layout.tableBorderClass}`} style={{ ...borderStyle, width: thickness, transformOrigin: 'left', transform: `rotateY(-90deg) translateZ(0px)` }}></div>
                <div className={`absolute top-0 left-0 w-full h-[${thickness}px] ${skin.layout.tableBorderClass}`} style={{ ...borderStyle, height: thickness, transformOrigin: 'top', transform: `rotateX(90deg) translateZ(0px)` }}></div>
                <div className="absolute inset-4 bg-black blur-[80px] opacity-90 rounded-[50%]" style={{ transform: `translateZ(-${thickness * 3}px) scale(0.9)` }}></div>
            </div>
            <div className="absolute inset-0 z-20 pointer-events-none" style={{ transform: `translateZ(${thickness / 2}px)`, transformStyle: 'preserve-3d' }}>
                {children}
            </div>
        </div>
    );
});

const getDiaoStatusText = (player: Player) => {
    if (!player.trickPile) return "-";
    const trickCount = player.trickPile.filter(t => t.round <= 8 && !t.isKaiChong && t.isFaceUp).length;
    if (trickCount < 2) return "赤脚";
    if (trickCount === 2) return "正本";
    if (trickCount === 3) return "得吊";
    return "双吊";
};

const getPlayerGlow = (player: Player) => {
    if (player.isDealer) return { color: '#ef4444', secondaryColor: '#b91c1c', intensity: 0.9 };
    if (player.isBaiLaoRevealed) return { color: '#10b981', secondaryColor: '#047857', intensity: 0.9 };
    if (player.isSuspectedBaiLao) return { color: '#f59e0b', secondaryColor: '#b45309', intensity: 0.7 };
    return null;
};

const BulletCard = React.memo(({ card, playerPos, spread, centerOffset, isFaceDown, isWinner }: any) => {
    const [style, setStyle] = useState<React.CSSProperties>(() => {
        let startX = 0, startY = 0;
        switch(playerPos) {
            case 'Bottom': startY = 400; break;
            case 'Top': startY = -400; break;
            case 'Left': startX = -400; break;
            case 'Right': startX = 400; break;
        }
        return {
            transform: `translate(-50%, -50%) translate(${startX}px, ${startY}px) rotateX(-25deg) scale(1.5) translateZ(35px)`,
            opacity: 0,
            transition: 'none'
        };
    });

    useEffect(() => {
        let tx = 0, ty = 0;
        const { x: spreadX, y: spreadY } = spread;
        const { x: cx, y: cy } = centerOffset;

        if (playerPos === 'Bottom') { tx = 0; ty = spreadY; }
        else if (playerPos === 'Top') { tx = 0; ty = -spreadY; }
        else if (playerPos === 'Left') { tx = -spreadX; ty = 0; }
        else if (playerPos === 'Right') { tx = spreadX; ty = 0; }

        tx += cx;
        ty += cy;

        const baseZ = 35; 
        const z = isWinner ? baseZ + 40 : baseZ;
        const scale = isWinner ? 1.2 : 1.0;

        const raf = requestAnimationFrame(() => {
            setStyle({
                transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) rotateX(-25deg) scale(${scale}) translateZ(${z}px)`,
                opacity: 1,
                transition: 'transform 0.4s cubic-bezier(0.2, 1.3, 0.4, 1), opacity 0.3s ease-out'
            });
        });
        return () => cancelAnimationFrame(raf);
    }, [playerPos, spread, centerOffset, isWinner]);

    return (
        <div className="absolute left-1/2 top-1/2 w-16 h-24" style={style}>
            <CardComponent card={card} isTrick isFaceDown={isFaceDown} isWinner={isWinner} isSmall={false} />
        </div>
    );
});

const TableCards = React.memo(({ cards, winnerId, layoutConfig, players }: any) => {
    if (!cards || cards.length === 0) return null;
    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', transformStyle: 'preserve-3d', zIndex: 10 }}>
            {cards.map((tc: any) => {
                const player = players.find((p: any) => p.id === tc.playerId);
                const pos = player?.position || 'Bottom';
                const isWinner = winnerId === tc.playerId;
                return (
                    <BulletCard 
                        key={`${tc.card.id}-${tc.playerId}`}
                        card={tc.card}
                        playerPos={pos}
                        spread={layoutConfig.tableCardSpread}
                        centerOffset={layoutConfig.cardCenterOffset}
                        isFaceDown={tc.isFaceDown}
                        isWinner={isWinner}
                    />
                );
            })}
        </div>
    );
});

const AIHandCompact = React.memo(({ count, baseRotation = 0, scale = 1, alignLeft = false, alignRight = false, skin }: { count: number, baseRotation: number, scale: number, alignLeft?: boolean, alignRight?: boolean, skin: any }) => {
    if (count <= 0) return null;
    return (
        <div style={{ position: 'relative', width: `${64*scale}px`, height: `${96*scale}px`, transformStyle: 'preserve-3d' }}>
            {[...Array(Math.min(count, 3))].map((_, i) => {
                let xOff = -i;
                if (alignLeft) xOff = i * 2;
                if (alignRight) xOff = -i * 2;
                return (
                    <div key={i} className="absolute inset-0 shadow-sm rounded-[3px] border-white/10"
                        style={{ 
                            transform: `translateZ(${i * 1}px) translate(${xOff}px, -${i}px)`,
                        }}>
                        <skin.card.BackComponent isSmall={true} />
                        <div className="absolute inset-0 bg-black/40 animate-pulse-slow pointer-events-none rounded-[inherit] border border-white/10 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]"></div>
                    </div>
                );
            })}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                 style={{ transform: `translateZ(${Math.min(count, 3) * 1 + 2}px) translate(${alignLeft ? Math.min(count,3)*2 : -Math.min(count,3)*2}px, -${Math.min(count, 3)}px)` }}>
                 <div className="text-[#e6c278] font-serif font-bold text-lg drop-shadow-md bg-black/50 px-2 rounded-full border border-[#5c4025]">{count}</div>
            </div>
        </div>
    );
});

const WonCardsGrid = React.memo(({ cards, baseRotation = 0, scale = 0.5, potCardIds, lanternGlow, playerId, forceVerticalLayout = false, align = 'center', isVertical = false, isFramed = false, hideBackground = false, hideLabel = false }: any) => {
    if (!cards || cards.length === 0) return null;
    const limit = 8; const gap = 4 * scale; const cw = 64 * scale; const ch = 96 * scale;
    const isGridVertical = forceVerticalLayout || (baseRotation === 90 || baseRotation === -90);
    const width = isGridVertical ? ch * Math.ceil(cards.length/limit) : cw * Math.min(cards.length, limit);
    const height = isGridVertical ? cw * Math.min(cards.length, limit) : ch * Math.ceil(cards.length/limit);
    const padding = 8 * scale; const realWidth = width + padding * 2; const realHeight = height + padding * 2;
    let offsetX = -width / 2; if (align === 'left') offsetX = 0; if (align === 'right') offsetX = -width;
    const offsetY = -height / 2; const textRot = isVertical ? 0 : (playerId === 2 ? 180 : 0);

    return (
        <div style={{ position: 'relative', width: 0, height: 0, transformStyle: 'preserve-3d' }}>
            {!hideBackground && (
                <div className="absolute rounded-[8px]" style={{ width: realWidth, height: realHeight, left: offsetX - padding, top: offsetY - padding, transform: `translateZ(-2px)`, background: 'rgba(0, 0, 0, 0.25)', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.6)' }}></div>
            )}
            {cards.map((card: any, i: number) => {
                let col = i % limit; let row = Math.floor(i / limit); let x = col * (cw + gap); let y = row * (ch + gap);
                if (isGridVertical) { x = row * (ch + gap); y = col * (cw + gap); }
                const cardCenterX = x + cw/2 + offsetX; const cardCenterY = y + ch/2 + offsetY;
                const isSignificant = card.rank === CardRank.ZUN || card.rank === CardRank.BAI || card.rank === CardRank.JIAN || card.isPot;
                const activeGlow = isSignificant ? lanternGlow : null;

                return (
                    <div key={card.id} className="absolute w-16 h-24 transition-transform duration-500" 
                         style={{ 
                             left: 0, top: 0, marginLeft: -32*scale, marginTop: -48*scale, 
                             transform: `translate(${cardCenterX}px, ${cardCenterY}px) translateZ(${i*0.05}px) rotateZ(${baseRotation}deg) scale(${scale * 0.9})`,
                             filter: 'brightness(0.65)' 
                         }}>
                        <div className="absolute inset-0 rounded-[4px] shadow-[inset_0_0_8px_rgba(0,0,0,0.8)] z-50 pointer-events-none"></div>
                        <CardComponent 
                            card={card} 
                            isSmall={false} 
                            isTrick={false} 
                            isFaceDown={false} 
                            isInverted={card.isPot || potCardIds?.has(card.id)} 
                            textRotation={textRot} 
                            className="border-black/50" 
                            lanternGlow={activeGlow}
                            isLocked={true} 
                        />
                    </div>
                );
            })}
        </div>
    );
});

const PlayerZone3D = React.memo(({ player, position, isMyTurn, potCardIds, layoutConfig, showPaperDolls }: any) => {
    const { skin } = useSkin();
    const isHuman = player.type === 'HUMAN'; const cfg = layoutConfig.players[position]; if (!cfg) return null;
    let zoneRot = 0; let handPos: any = {}; let wonPos: any = {}; let forceVerticalWonGrid = false; let align: 'left' | 'right' | 'center' = 'center';
    let hideWonBackground = false; let hideWonLabel = false;

    if (position === 'Top') { zoneRot = 180; handPos = { top: '5%', left: '50%', transform: 'translateX(-50%)' }; wonPos = { top: '25%', left: '50%', transform: 'translateX(-50%)' }; } 
    else if (position === 'Left') { zoneRot = 90; handPos = { left: '5%', top: '50%', transform: 'translateY(-50%)' }; wonPos = { left: '20%', top: '50%', transform: 'translateY(-50%)' }; } 
    else if (position === 'Right') { zoneRot = -90; handPos = { right: '5%', top: '50%', transform: 'translateY(-50%)' }; wonPos = { right: '20%', top: '50%', transform: 'translateY(-50%)' }; } 
    else if (position === 'Bottom') { zoneRot = 0; wonPos = { bottom: '25%', left: '50%', transform: 'translateX(-50%)' }; }

    if (layoutConfig.isVertical) {
        if (position === 'Left' || position === 'Right') {
            zoneRot = 0; forceVerticalWonGrid = true;
            const wonCount = player.capturedCards.length;
            let dynamicScale = layoutConfig.cardScale; if (wonCount > 5) dynamicScale *= 0.85; if (wonCount > 8) dynamicScale *= 0.85;
            const shift = Math.min(wonCount, 8) * 1.0; 
            const baseHandTop = 42; const baseWonTop = 58; 
            const handTopVal = `${baseHandTop - shift}%`; const wonTopVal = `${baseWonTop - shift}%`;

            if (position === 'Left') { align = 'left'; handPos = { left: '3%', top: handTopVal, transform: 'translate(0, -50%)' }; wonPos = { left: '3%', top: wonTopVal, transform: `translate(0, -50%)` }; } 
            else { align = 'right'; handPos = { right: '3%', top: handTopVal, transform: 'translate(0, -50%)' }; wonPos = { right: '-5%', top: wonTopVal, transform: `translate(0, -50%)` }; }
            layoutConfig.tempWonScale = dynamicScale; 
        } 
        else if (position === 'Top') { 
            zoneRot = 0; 
            handPos = { top: '3%', left: '50%', transform: 'translateX(-50%)' }; 
            wonPos = { top: '23%', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }; 
        }
        else if (position === 'Bottom') { 
            const wonCount = player.capturedCards.length; 
            const isCrowded = wonCount > 10; 
            const wonScale = isCrowded ? layoutConfig.cardScale * 0.75 : layoutConfig.cardScale; 
            layoutConfig.tempWonScale = wonScale; 
            wonPos = { bottom: '19%', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }; 
            hideWonBackground = true; hideWonLabel = true;
        }
    }
    const lanternGlow = getPlayerGlow(player); const finalWonScale = layoutConfig.tempWonScale || layoutConfig.cardScale;
    const charStyle: any = { position: 'absolute', top: cfg.top, left: cfg.left, right: cfg.right, bottom: cfg.bottom, transform: `translate(${position==='Top' || position==='Left' ? '-50%' : '50%'}, -50%) rotateX(-45deg) rotateY(${position==='Top'?180:(position==='Left'?-20:20)}deg) scale(${cfg.scale})`, zIndex: 0 };
    if (layoutConfig.isVertical && (position === 'Left' || position === 'Right')) { charStyle.transform = `translateY(-50%) rotateX(-45deg) rotateY(${position==='Left' ? -15 : 15}deg) scale(${cfg.scale})`; }
    const wonCardsPointerEvents = position === 'Bottom' ? 'pointer-events-none' : 'pointer-events-auto';

    return (
        <div className="absolute inset-0 pointer-events-none z-[20]" style={{ transformStyle: 'preserve-3d' }}>
            {!isHuman && !layoutConfig.hidePaperDolls && showPaperDolls && <div style={charStyle} className="pointer-events-auto origin-bottom"><CharacterFigure player={player} position={position} isActive={isMyTurn} isBanker={player.isDealer} isBaiLao={player.isBaiLaoRevealed} statusText={getDiaoStatusText(player)} /></div>}
            {!isHuman && <div className="absolute pointer-events-auto transition-all duration-500" style={{ ...handPos, zIndex: 30 }}><AIHandCompact count={player.hand.length} baseRotation={zoneRot} scale={layoutConfig.cardScale} alignLeft={align==='left'} alignRight={align==='right'} skin={skin} /></div>}
            {player.capturedCards?.length > 0 && <div className={`absolute ${wonCardsPointerEvents} transition-all duration-500 opacity-90`} style={{ ...wonPos }}><WonCardsGrid cards={player.capturedCards} baseRotation={zoneRot} scale={finalWonScale} potCardIds={potCardIds} lanternGlow={lanternGlow} playerId={player.id} forceVerticalLayout={forceVerticalWonGrid} align={align} isVertical={layoutConfig.isVertical} isFramed={true} hideBackground={hideWonBackground} hideLabel={hideWonLabel} /></div>}
        </div>
    );
});

// --- UPDATED POT STACK: Altar Spiral for Mobile Portrait ---
const PotStack = React.memo(({ pot, mianZhang, phase, kaiChongCardIndex, layoutConfig, lastGameEvent, kaiChongHistory }: any) => {
    if (phase !== GamePhase.KAI_CHONG) return null;
    const isKaiChong = phase === GamePhase.KAI_CHONG; 
    const visiblePot = pot; 
    const isVertical = layoutConfig.isVertical;
    const remainingCardsCount = Math.max(1, visiblePot.length - kaiChongCardIndex + 1); 
    
    let currentScale = layoutConfig.pot.scale;
    if (isVertical) currentScale = 0.75; 

    const getCardGlow = (card: Card, index: number) => {
        if (!isKaiChong) return null;
        if (index === kaiChongCardIndex - 1 && lastGameEvent?.type === 'KAI_CHONG_SUCCESS') {
            if (card.color === CardColor.GREEN) return { color: '#22c55e', secondaryColor: '#4ade80', intensity: 1.5 }; 
            if (card.color === CardColor.RED) return { color: '#ef4444', secondaryColor: '#f59e0b', intensity: 1.5 }; 
            return { color: '#60a5fa', secondaryColor: '#93c5fd', intensity: 1.5 }; 
        } return null;
    };

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', transformStyle: 'preserve-3d', zIndex: 5 }}>
            {visiblePot.map((c: Card, i: number) => {
                const isRevealed = i < kaiChongCardIndex; 
                const isCurrent = i === kaiChongCardIndex; 
                const isFuture = i > kaiChongCardIndex;
                const wasMatched = kaiChongHistory?.some((h:any) => h.matchedCard.id === c.id);
                
                let tx = 0; let ty = 0; let rot = 0; let s = currentScale; let z = i * 2; 
                
                if (isKaiChong) {
                    if (isVertical) {
                        // VERTICAL SPIRAL FOR MOBILE PORTRAIT
                        // Center X = 0 (Relative to Compass)
                        const spacing = 50 * currentScale; 
                        const startY = -200; 
                        
                        // "Altar Spiral" Logic
                        const spiralOffset = Math.sin(i * 0.6) * 30; // Snake/S-Curve offset
                        
                        tx = spiralOffset;
                        ty = startY + (i * spacing);
                        rot = i * 8; // Gentle twist for aesthetic
                        
                    } else {
                        // Standard Landscape Vertical Stack
                        const stepY = 40; 
                        const startY = -120; 
                        ty = startY + (i * stepY);
                        rot = 0;
                    }

                    if (wasMatched && lastGameEvent?.type === 'KAI_CHONG_SUCCESS') {
                        const winnerId = lastGameEvent.playerId;
                        if (indexMatch(i, kaiChongCardIndex - 1)) { 
                             const flightDist = 600; 
                             if (winnerId === 0) { ty += flightDist; rot += 10; } 
                             else if (winnerId === 1) { tx += flightDist; rot += 90; } 
                             else if (winnerId === 2) { ty -= flightDist; rot -= 10; } 
                             else if (winnerId === 3) { tx -= flightDist; rot -= 90; } 
                             s = currentScale * 0.8; z = 200; 
                        } else {
                             if (i < kaiChongCardIndex - 1) return null;
                        }
                    } else if (isCurrent) {
                        z = 50;
                        s = currentScale * 1.1;
                    }
                }
                
                const isFaceDown = isFuture; 
                const glow = getCardGlow(c, i);
                
                const flightStyle = (wasMatched && lastGameEvent?.type === 'KAI_CHONG_SUCCESS' && indexMatch(i, kaiChongCardIndex - 1))
                    ? { transition: 'transform 0.4s cubic-bezier(0.5, 0, 0.2, 1), opacity 0.4s ease-in' }
                    : { transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' };

                return ( 
                    <div key={c.id} className={`absolute left-1/2 top-1/2 w-16 h-24 ${isCurrent ? 'animate-breathe-subtle' : ''}`}
                         style={{ 
                             transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${s}) translateZ(${z}px)`,
                             ...flightStyle
                         }}> 
                        <CardComponent card={c} isFaceDown={isFaceDown} isSmall={false} isInverted={true} lanternGlow={glow} /> 
                    </div> 
                );
            })}
        </div>
    );
});

// Helper for exact index matching to prevent "flying" old cards
const indexMatch = (i: number, target: number) => i === target;

export const Scene3D = React.memo(({ state, interactionState }: any) => {
    const { skin } = useSkin();
    const mode = useLayoutMode();
    const layoutConfig = LAYOUT_CONFIGS[mode] || LAYOUT_CONFIGS['desktop']; 
    const { graphicsQuality, showPaperDolls } = useGameSettings(); 
    const { phase, currentPlayerIndex, trickWinnerId, tableCards, players, bankerId, pot, mianZhangCard, gameMessage, violationNotification, kaiChongCardIndex, kaiChongHistory, lastGameEvent } = state;
    const playedPlayerIds = useMemo(() => tableCards ? tableCards.map((tc: any) => tc.playerId) : [], [tableCards]);
    const visualYOffset = '0px';

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden select-none bg-[#020101]">
            <skin.layout.atmosphereComponent quality={graphicsQuality} />
            {layoutConfig.isVertical && <TopPaperScreen skinId={skin.id} />}
            <CinematicOverlay />
            
            <div className="w-full h-full perspective-container" style={{ perspective: layoutConfig.camera.perspective }}>
                <div className="world-3d w-full h-full relative preserve-3d transition-transform duration-1000 ease-out" style={{ transform: `rotateX(${layoutConfig.camera.rotateX}deg) translateY(-50%) translateZ(${layoutConfig.camera.z}px)`, transformStyle: 'preserve-3d' }}>
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 preserve-3d transition-all duration-1000" style={{ top: layoutConfig.tableY, width: layoutConfig.table.width, height: layoutConfig.table.height, transformStyle: 'preserve-3d' }}>
                        {!layoutConfig.hidePingFeng && <PingFeng skinId={skin.id} />}
                        <TableSlab skin={skin} width={layoutConfig.table.width} height={layoutConfig.table.height} visualYOffset={visualYOffset}>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[10]" style={{ transform: `translateY(0%) translateZ(1px)` }}>
                                <div className="w-full max-w-[800px] relative opacity-90 transition-all duration-700" style={{ aspectRatio: layoutConfig.isVertical ? '3/4' : '2/1' }}>
                                    <Compass activePlayerId={currentPlayerIndex} bankerId={bankerId} revealedBaiLaoId={players.find((p:any)=>p.isBaiLaoRevealed)?.id??null} suspectedBaiLaoId={players.find((p:any)=>p.isSuspectedBaiLao)?.id??null} hasTableCards={tableCards?.length>0} playedPlayerIds={playedPlayerIds} phase={phase} isVertical={layoutConfig.isVertical}/>
                                    <skin.lighting.TableBorderFlow activePlayerId={currentPlayerIndex} isVertical={layoutConfig.isVertical} />
                                </div>
                            </div>
                            {phase !== GamePhase.DEALING && (
                                <>
                                    {players.map((p: Player) => {
                                        const myKc = kaiChongHistory.filter((h:any) => h.playerId === p.id);
                                        const potIds = new Set(myKc.map((m:any) => m.matchedCard.id));
                                        return <PlayerZone3D key={p.id} player={p} position={p.position} isMyTurn={currentPlayerIndex === p.id} potCardIds={potIds} layoutConfig={layoutConfig} quality={graphicsQuality} showPaperDolls={showPaperDolls} />;
                                    })}
                                    <PotStack pot={pot} mianZhang={mianZhangCard} phase={phase} kaiChongCardIndex={kaiChongCardIndex} layoutConfig={layoutConfig} lastGameEvent={lastGameEvent} kaiChongHistory={kaiChongHistory} />
                                    <TableCards cards={tableCards} winnerId={trickWinnerId} layoutConfig={layoutConfig} players={players} />
                                </>
                            )}
                            <skin.lighting.StoveLighting activePlayerId={currentPlayerIndex} spotlightPos={phase === GamePhase.KAI_CHONG ? { x: `${50 + (kaiChongCardIndex - 3) * 8}%`, y: '50%' } : null} />
                            {interactionState && !layoutConfig.isVertical && ( <ActionPlate3D label={interactionState.label} disabled={interactionState.disabled} onClick={interactionState.onActionClick} skin={skin} isVertical={layoutConfig.isVertical} /> )}
                            {gameMessage && ( <div className="absolute top-[32%] left-1/2 z-[1000] flex items-center justify-center pointer-events-none" style={{ transform: 'translate(-50%, -50%) translateZ(120px) rotateX(-45deg)', width: '100%', textAlign: 'center' }}> <div className="text-[#e6c278] font-calligraphy text-3xl md:text-4xl drop-shadow-[0_5px_15px_rgba(0,0,0,1)] bg-[#0f0a08]/90 px-10 py-4 rounded-sm border-y-2 border-[#8c6239] backdrop-blur-xl animate-fade-in-up tracking-[0.3em] shadow-lg">{gameMessage}</div> </div> )}
                            {violationNotification && ( <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200]" style={{ transform: 'translateZ(200px) rotateX(-45deg)' }}> <div className="bg-[#1a0505]/95 border-4 border-[#8c1c0b] p-10 text-center shadow-[0_0_150px_rgba(255,0,0,0.6)] rounded-sm animate-shake backdrop-blur-md"> <h3 className="text-4xl text-[#ff4d4d] font-bold uppercase mb-4 tracking-[0.3em] drop-shadow-md">{violationNotification.title}</h3> <p className="text-[#e8e4d9] text-xl font-serif leading-relaxed">{violationNotification.message}</p> </div> </div> )}
                        </TableSlab>
                    </div>
                </div>
            </div>
        </div>
    );
});
