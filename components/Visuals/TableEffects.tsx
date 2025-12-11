
import React, { useMemo } from 'react';
import { GamePhase } from '../../types';

// STOVE LIGHTING (Ambient atmospheric glow)
export const StoveLighting = React.memo(({ activePlayerId, spotlightPos }: { activePlayerId: number, spotlightPos?: {x: string, y: string} | null }) => {
    const styles = useMemo(() => {
        if (spotlightPos) {
            return {
                background: `radial-gradient(circle at ${spotlightPos.x} ${spotlightPos.y}, 
                    rgba(255, 215, 0, 0.4) 0%, 
                    rgba(184, 134, 11, 0.1) 30%, 
                    rgba(0, 0, 0, 0.9) 70%)`,
                transition: 'background 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                mixBlendMode: 'screen' as any
            };
        }
        return { background: 'transparent' }; 
    }, [spotlightPos]);

    return (
        <div className="absolute inset-0 z-[5] pointer-events-none" style={styles}></div>
    );
});

// =============================================================================
// COMPASS GEOMETRY (WIDER STADIUM SHAPE)
// =============================================================================
// Adjusted coordinates for a wider, more stable look on mobile portrait
// Width: -200 to 600 (800 units), Height: -50 to 350 (400 units). Ratio 2:1
const VIEWBOX_STR = "-250 -100 900 550"; 

const PATH_FULL_SHAPE = "M -100 0 L 500 0 A 175 175 0 0 1 500 350 L -100 350 A 175 175 0 0 1 -100 0 Z";

// Sectors for lighting logic
const PATH_NORTH = "M -100 0 L 500 0"; // Top Edge
const PATH_SOUTH = "M 500 350 L -100 350"; // Bottom Edge
const PATH_EAST = "M 500 0 A 175 175 0 0 1 500 350"; // Right Curve
const PATH_WEST = "M -100 350 A 175 175 0 0 1 -100 0"; // Left Curve

// Crosshair
const PATH_CROSS_V = "M 200 0 L 200 350";
const PATH_CROSS_H = "M -100 175 L 500 175";

export const TableBorderFlow = React.memo(({ activePlayerId, isVertical = false }: { activePlayerId: number, isVertical?: boolean }) => {
    return (
        <div className="absolute inset-0 pointer-events-none z-[12] overflow-visible" style={{ transform: isVertical ? 'rotate(90deg)' : 'none', transition: 'transform 0.5s ease-out' }}>
            <svg className="w-full h-full overflow-visible" viewBox={VIEWBOX_STR} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <filter id="gold-glow-flow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <linearGradient id="flowGrad" gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#B8860B" stopOpacity="0" />
                        <stop offset="50%" stopColor="#FFD700" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#B8860B" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <style>
                    {`
                        @keyframes stadiumFlow {
                            0% { stroke-dashoffset: 3000; } 
                            100% { stroke-dashoffset: 0; }
                        }
                    `}
                </style>
                <path 
                    d={PATH_FULL_SHAPE} 
                    stroke="url(#flowGrad)" 
                    strokeWidth="3" 
                    fill="none" 
                    strokeLinecap="round" 
                    filter="url(#gold-glow-flow)" 
                    strokeDasharray="400 1600" 
                    style={{ animation: 'stadiumFlow 6s linear infinite' }}
                />
            </svg>
        </div>
    );
});

export const Compass = React.memo(({ 
    activePlayerId, 
    bankerId, 
    revealedBaiLaoId, 
    suspectedBaiLaoId,
    playedPlayerIds = [], 
    hasTableCards,
    phase,
    isVertical = false
}: { 
    activePlayerId: number, 
    bankerId: number, 
    revealedBaiLaoId: number | null,
    suspectedBaiLaoId: number | null,
    playedPlayerIds?: number[],
    hasTableCards?: boolean,
    phase?: GamePhase,
    isVertical?: boolean
}) => {
    
    // Rotation mapping: 0=S(180), 1=E(90), 2=N(0), 3=W(-90)
    const rotation = useMemo(() => {
        let deg = 0;
        switch(activePlayerId) {
            case 0: deg = 180; break; 
            case 1: deg = 90; break;  
            case 2: deg = 0; break;   
            case 3: deg = -90; break; 
        }
        return deg;
    }, [activePlayerId]);

    // Sector Mapping for Highlight
    const sectorMapping = useMemo(() => {
        if (isVertical) {
            return { 2: 3, 0: 1, 1: 2, 3: 0 }; // Adjusted for 90deg rotation visually
        }
        return { 0:0, 1:1, 2:2, 3:3 };
    }, [isVertical]);

    // Needle Shadow logic
    const { shadowX, shadowY } = useMemo(() => {
        let lx = 0, ly = 0;
        if (playedPlayerIds.includes(0)) ly += 1;
        if (playedPlayerIds.includes(1)) lx += 1;
        if (playedPlayerIds.includes(2)) ly -= 1;
        if (playedPlayerIds.includes(3)) lx -= 1;
        const mag = Math.sqrt(lx*lx + ly*ly);
        if (mag === 0) return { shadowX: 0, shadowY: 2 };
        const scale = 12;
        return { shadowX: -(lx / mag) * scale, shadowY: -(ly / mag) * scale };
    }, [playedPlayerIds]);

    const isDualRole = (pid: number) => pid === bankerId && pid === revealedBaiLaoId;
    const getPlayerColorValues = (pid: number) => {
        if (isDualRole(pid)) return { main: '#ef4444', sub: '#14b8a6', isSplit: true }; 
        if (pid === bankerId) return { main: '#b91c1c', sub: '#b91c1c', isSplit: false }; // Darker Red
        if (pid === revealedBaiLaoId) return { main: '#0d9488', sub: '#0d9488', isSplit: false }; // Teal
        return { main: '#d4af37', sub: '#d4af37', isSplit: false }; // Gold
    };

    const activeColors = getPlayerColorValues(activePlayerId);
    const needleBg = activeColors.isSplit
        ? `linear-gradient(90deg, ${activeColors.main} 50%, ${activeColors.sub} 50%)`
        : `linear-gradient(90deg, ${activeColors.main} 0%, #ffefdb 50%, ${activeColors.main} 100%)`;

    // Marking Styles - ABSOLUTELY POSITIONED INSIDE THE SVG COORDINATE SPACE via HTML overlay
    // We use a tight layout.
    const getTextClass = (pid: number) => {
        const isActive = activePlayerId === pid;
        const base = "absolute font-serif font-bold transition-all duration-700 transform -translate-x-1/2 -translate-y-1/2 z-[25]";
        if (isActive) return `${base} text-[#ffdb7a] text-2xl md:text-3xl drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] scale-110`;
        return `${base} text-[#3e2b22] text-xl opacity-40`;
    };

    return (
        <div className="relative w-full h-full pointer-events-none z-[0]" style={{ transformStyle: 'preserve-3d' }}>
            
            {/* 1. THE GLASS COMPASS BODY */}
            <div className="absolute inset-0 z-[10]" style={{ transform: isVertical ? 'rotate(90deg) translateZ(0px)' : 'translateZ(0px)', transition: 'transform 0.5s ease-out' }}>
                <svg className="w-full h-full overflow-visible" viewBox={VIEWBOX_STR} preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <linearGradient id="glassBody" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#0a0503" stopOpacity="0.4" />
                            <stop offset="50%" stopColor="#1a0f0a" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#0a0503" stopOpacity="0.4" />
                        </linearGradient>
                        <filter id="insetShadow">
                            <feComponentTransfer in="SourceAlpha"><feFuncA type="table" tableValues="1 0" /></feComponentTransfer>
                            <feGaussianBlur stdDeviation="4"/>
                            <feOffset dx="0" dy="2" result="offsetblur"/>
                            <feFlood floodColor="rgb(0, 0, 0)" floodOpacity="1"/>
                            <feComposite in2="offsetblur" operator="in"/>
                            <feComposite in2="SourceAlpha" operator="in" />
                            <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode /></feMerge>
                        </filter>
                    </defs>

                    {/* Dark Glass Background */}
                    <path d={PATH_FULL_SHAPE} fill="url(#glassBody)" stroke="none" />
                    
                    {/* Inner Etchings */}
                    <g stroke="#3e2b22" strokeWidth="1" opacity="0.3" fill="none">
                        <path d={PATH_CROSS_V} />
                        <path d={PATH_CROSS_H} />
                        <circle cx="200" cy="175" r="100" />
                    </g>

                    {/* Thick Rim */}
                    <path d={PATH_FULL_SHAPE} fill="none" stroke="#2b180d" strokeWidth="8" filter="url(#insetShadow)" opacity="0.8"/>
                    <path d={PATH_FULL_SHAPE} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" style={{mixBlendMode: 'overlay'}}/>

                    {/* Active Sector Highlights */}
                    <g style={{ mixBlendMode: 'screen' }}>
                        {[
                            { id: 2, path: PATH_NORTH, orient: 'H' }, 
                            { id: 1, path: PATH_EAST, orient: 'V' },  
                            { id: 0, path: PATH_SOUTH, orient: 'H' }, 
                            { id: 3, path: PATH_WEST, orient: 'V' }   
                        ].map(sector => {
                            // Find which player corresponds to this SVG sector
                            // Inverse the map: find key where val = sector.id
                            const pidStr = Object.keys(sectorMapping).find(k => sectorMapping[parseInt(k)] === sector.id);
                            const pid = pidStr ? parseInt(pidStr) : -1;
                            const isLit = pid === activePlayerId || playedPlayerIds.includes(pid);
                            
                            return (
                                <path 
                                    key={sector.id}
                                    d={sector.path}
                                    fill="none"
                                    stroke={isLit ? getPlayerColorValues(pid).main : 'transparent'}
                                    strokeWidth={isLit ? 4 : 0} 
                                    strokeLinecap="round"
                                    filter="url(#gold-glow-flow)"
                                    style={{ transition: 'stroke 0.3s ease-out' }}
                                />
                            );
                        })}
                    </g>
                </svg>
            </div>

            {/* 2. THE NEEDLE (Physical 3D Object) */}
            <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none" 
                 style={{ 
                     transformStyle: 'preserve-3d', 
                     transform: 'translateZ(20px)' 
                 }}>
                 
                 <div className="relative transition-transform duration-1000 ease-out-expo scale-[1.8]" 
                      style={{ transform: `rotate(${rotation}deg) scale(1.8)` }}>
                        
                        {/* Shadow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[12px] h-[60px] bg-black blur-[4px] transition-all duration-700"
                             style={{ 
                                 transform: `translate(${shadowX}px, ${shadowY}px) scale(1.1) translateZ(-20px)`, 
                                 clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                                 opacity: 0.6
                             }}>
                        </div>

                        {/* Needle Body */}
                        <div className="relative -top-[25px]">
                             {/* North Pole (Colored) */}
                             <div className="w-[10px] h-[55px] mx-auto transition-colors duration-500"
                                  style={{ 
                                      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', 
                                      background: needleBg,
                                      boxShadow: 'inset 2px 0 3px rgba(255,255,255,0.3)',
                                  }}>
                             </div>
                             {/* South Pole (White/Silver) */}
                             <div className="w-[10px] h-[55px] mx-auto bg-gradient-to-b from-[#e0e0e0] to-[#999] rotate-180"
                                  style={{ 
                                      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', 
                                      marginTop: '-1px'
                                  }}>
                             </div>
                        </div>

                        {/* Cap */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8c6239] shadow-md border border-[#3e2b22] z-50">
                            <div className="w-1.5 h-1.5 bg-[#1a0f0a] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                 </div>
            </div>

            {/* 3. MARKINGS (Retracted & Glowing) */}
            {/* Position Percentages are tuned for the Wide Stadium Shape */}
            <div className="absolute inset-0 z-[25] pointer-events-none" style={{ transform: 'translateZ(10px)' }}>
                 {/* Top (North) - 25% down */}
                 <div className={getTextClass(2)} style={{ top: '25%', left: '50%' }}>北</div>
                 
                 {/* Bottom (South) - 75% down */}
                 <div className={getTextClass(0)} style={{ top: '75%', left: '50%' }}>南</div>
                 
                 {/* Left (West) - 20% in */}
                 <div className={getTextClass(3)} style={{ top: '50%', left: '20%' }}>西</div>
                 
                 {/* Right (East) - 80% in (or 20% from right) */}
                 <div className={getTextClass(1)} style={{ top: '50%', left: '80%' }}>東</div>
            </div>
        </div>
    );
});
