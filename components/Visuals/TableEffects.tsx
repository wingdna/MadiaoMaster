
import React, { useMemo } from 'react';
import { GamePhase } from '../../types';

// =============================================================================
// STOVE LIGHTING (Ambient)
// =============================================================================
export const StoveLighting = React.memo(({ activePlayerId, spotlightPos }: { activePlayerId: number, spotlightPos?: {x: string, y: string} | null }) => {
    const styles = useMemo(() => {
        if (spotlightPos) {
            return {
                background: `radial-gradient(circle at ${spotlightPos.x} ${spotlightPos.y}, 
                    rgba(255, 215, 0, 0.2) 0%, 
                    rgba(184, 134, 11, 0.05) 40%, 
                    transparent 70%)`,
                transition: 'background 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
                mixBlendMode: 'plus-lighter' as any
            };
        }
        return { background: 'transparent' }; 
    }, [spotlightPos]);

    return (
        <div className="absolute inset-0 z-[5] pointer-events-none transition-all duration-1000" style={styles}></div>
    );
});

// =============================================================================
// COMPASS & TABLE FLOW
// =============================================================================

// V44: Widened Compass Shape (Height 350 -> 440). Increased ViewBox Height (550 -> 640).
// Center aligned at Y=220 (Previously 175) to maintain wrapping.
const VIEWBOX_STR = "-250 -100 900 640"; 
const PATH_FULL_SHAPE = "M -100 0 L 500 0 A 220 220 0 0 1 500 440 L -100 440 A 220 220 0 0 1 -100 0 Z";

const PATH_NORTH = "M -100 0 L 500 0"; 
const PATH_SOUTH = "M 500 440 L -100 440"; 
const PATH_EAST = "M 500 0 A 220 220 0 0 1 500 440"; 
const PATH_WEST = "M -100 440 A 220 220 0 0 1 -100 0"; 

export const TableBorderFlow = React.memo(({ activePlayerId, isVertical = false }: { activePlayerId: number, isVertical?: boolean }) => {
    return (
        <div className="absolute inset-0 pointer-events-none z-[12] overflow-visible mix-blend-screen" style={{ transform: isVertical ? 'rotate(90deg)' : 'none', transition: 'transform 0.5s ease-out' }}>
            <svg className="w-full h-full overflow-visible" viewBox={VIEWBOX_STR} preserveAspectRatio="xMidYMid meet">
                <defs>
                    {/* V2: Removed Blur for "Sharp Brightness". Hard liquid gold feel. */}
                    <linearGradient id="teaFlowGrad" gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8c6239" stopOpacity="0" />
                        <stop offset="20%" stopColor="#d4af37" stopOpacity="0.4" />
                        {/* Core is almost white-gold for maximum brightness without bloom */}
                        <stop offset="50%" stopColor="#fff8e1" stopOpacity="1" /> 
                        <stop offset="80%" stopColor="#d4af37" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8c6239" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <style>
                    {`
                        @keyframes borderFlowReverse {
                            0% { stroke-dashoffset: 0; } 
                            100% { stroke-dashoffset: 2000; }
                        }
                    `}
                </style>
                <path 
                    d={PATH_FULL_SHAPE} 
                    stroke="url(#teaFlowGrad)" 
                    strokeWidth="3" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeDasharray="300 1700" 
                    style={{ animation: 'borderFlowReverse 4s linear infinite' }}
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
    
    // Smooth Rotation
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

    const sectorMapping = useMemo(() => {
        if (isVertical) return { 2: 3, 0: 1, 1: 2, 3: 0 }; 
        return { 0:0, 1:1, 2:2, 3:3 };
    }, [isVertical]);

    // Needle Logic
    const isDualRole = (pid: number) => pid === bankerId && pid === revealedBaiLaoId;
    const getPlayerColorValues = (pid: number) => {
        if (isDualRole(pid)) return { main: '#ef4444', glow: '#ef4444', needle: '#dc2626' }; // Red (Banker+BaiLao)
        if (pid === bankerId) return { main: '#b91c1c', glow: '#ff0000', needle: '#b91c1c' }; // Red (Banker)
        if (pid === revealedBaiLaoId) return { main: '#0d9488', glow: '#2dd4bf', needle: '#0f766e' }; // Teal (BaiLao)
        return { main: '#d4af37', glow: '#ffeebb', needle: '#b8860b' }; // Gold (Peasant)
    };

    const getIdentityLabel = (pid: number, defaultText: string) => {
        if (pid === bankerId) return '庄';
        if (pid === revealedBaiLaoId) return '百';
        return defaultText;
    };

    const getTextClass = (pid: number) => {
        const isActive = activePlayerId === pid;
        const isTheBanker = pid === bankerId;
        const isTheBaiLao = pid === revealedBaiLaoId;
        
        let colorClass = "text-[#5c4025] opacity-60 mix-blend-overlay"; // Default Bronze
        let glowStyle = "";
        let scaleClass = "scale-100";

        // Identity Colors
        if (isTheBanker) {
            colorClass = "text-[#ef4444] opacity-90 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]"; // Red
            glowStyle = "animate-pulse-slow";
        } else if (isTheBaiLao) {
            colorClass = "text-[#34d399] opacity-90 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"; // Green
            glowStyle = "animate-pulse-slow";
        }

        // Active State Overrides
        if (isActive) {
            scaleClass = "scale-125 md:scale-150";
            if (!isTheBanker && !isTheBaiLao) {
                // Normal player active: Gold
                colorClass = "text-[#ffdb7a] opacity-100 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]"; 
            } else {
                // Identity player active: Brighten Identity Color
                colorClass = colorClass.replace("opacity-90", "opacity-100 brightness-150");
                glowStyle = ""; // Disable pulse when active to avoid conflicting with scale animation if any
            }
        }

        // V45 Update: Base text size increased to text-sm (was text-xs) for better mobile visibility
        return `absolute font-serif font-bold transition-all duration-700 transform -translate-x-1/2 -translate-y-1/2 z-[25] flex items-center justify-center text-sm md:text-xl ${colorClass} ${scaleClass} ${glowStyle}`;
    };

    // Glass Lid Animation Logic
    const isKaiChong = phase === GamePhase.KAI_CHONG;
    // When Kai Chong starts, glass slides open (Top goes Up, Bottom goes Down)
    // We assume the Compass center is at Y=220.
    const lidTranslateY = isKaiChong ? 300 : 0; 

    // CALCULATE ACTIVE NEEDLE COLOR
    const activeColors = getPlayerColorValues(activePlayerId);

    return (
        <div className="relative w-full h-full pointer-events-none z-[0]" style={{ transformStyle: 'preserve-3d' }}>
            
            {/* 1. GLASS LID (Split into Top/Bottom Halves for Opening Animation) */}
            <div className="absolute inset-0 z-[10]" style={{ transform: isVertical ? 'rotate(90deg) translateZ(0px)' : 'translateZ(0px)', transition: 'transform 0.5s ease-out' }}>
                <svg className="w-full h-full overflow-visible" viewBox={VIEWBOX_STR} preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="white" stopOpacity="0.05" />
                            <stop offset="40%" stopColor="white" stopOpacity="0.0" />
                            <stop offset="60%" stopColor="white" stopOpacity="0.0" />
                            <stop offset="100%" stopColor="white" stopOpacity="0.1" />
                        </linearGradient>
                        <filter id="rimGlow">
                            <feGaussianBlur stdDeviation="2" result="blur"/>
                            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                        </filter>
                        
                        {/* Split Clips for Lid Opening */}
                        <clipPath id="clipTopHalf">
                            <rect x="-250" y="-100" width="900" height="320" /> {/* Covers roughly top half to Y=220 */}
                        </clipPath>
                        <clipPath id="clipBottomHalf">
                            <rect x="-250" y="220" width="900" height="420" /> {/* Covers bottom half from Y=220 */}
                        </clipPath>
                    </defs>

                    {/* Dark Background Plate (Always Static, The "Pit") */}
                    <path d={PATH_FULL_SHAPE} fill="#050302" stroke="none" opacity="0.6" />
                    
                    {/* Inner Rim (Gold/Bronze) - Static */}
                    <path d={PATH_FULL_SHAPE} fill="none" stroke="#3e2b22" strokeWidth="2" opacity="0.5" />

                    {/* TOP GLASS LID */}
                    <g style={{ transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)', transform: `translateY(-${lidTranslateY}px)` }} clipPath="url(#clipTopHalf)">
                        <path d={PATH_FULL_SHAPE} fill="url(#glassReflection)" stroke="none" style={{ mixBlendMode: 'overlay' }} />
                        {/* Top Rim Segment */}
                        <path d="M -100 220 L 500 220" stroke="#5c4025" strokeWidth="1" opacity="0.5" /> 
                    </g>

                    {/* BOTTOM GLASS LID */}
                    <g style={{ transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)', transform: `translateY(${lidTranslateY}px)` }} clipPath="url(#clipBottomHalf)">
                        <path d={PATH_FULL_SHAPE} fill="url(#glassReflection)" stroke="none" style={{ mixBlendMode: 'overlay' }} />
                        {/* Bottom Rim Segment */}
                        <path d="M -100 220 L 500 220" stroke="#5c4025" strokeWidth="1" opacity="0.5" /> 
                    </g>

                    {/* Crosshairs & Grid (Static on base) */}
                    <g style={{ mixBlendMode: 'plus-lighter', opacity: isKaiChong ? 0.3 : 1, transition: 'opacity 1s' }}>
                        <line x1="-80" y1="220" x2="480" y2="220" stroke="#8c6239" strokeWidth="1.5" opacity="0.5" strokeDasharray="6 3" />
                        <line x1="200" y1="20" x2="200" y2="420" stroke="#8c6239" strokeWidth="1.5" opacity="0.5" strokeDasharray="6 3" />
                        <circle cx="200" cy="220" r="120" fill="none" stroke="#5c4025" strokeWidth="1" opacity="0.2" />
                        <circle cx="200" cy="220" r="40" fill="none" stroke="#d4af37" strokeWidth="1" opacity="0.15" />
                        <circle cx="200" cy="220" r="3" fill="#d4af37" opacity="0.8" />
                    </g>

                    {/* Sectors */}
                    <g style={{ mixBlendMode: 'screen', opacity: isKaiChong ? 0.5 : 1, transition: 'opacity 1s' }}>
                        {[
                            { id: 2, path: PATH_NORTH }, 
                            { id: 1, path: PATH_EAST },  
                            { id: 0, path: PATH_SOUTH }, 
                            { id: 3, path: PATH_WEST }   
                        ].map(sector => {
                            const pidStr = Object.keys(sectorMapping).find(k => (sectorMapping as any)[k] === sector.id);
                            const pid = pidStr ? parseInt(pidStr) : -1;
                            const isActive = pid === activePlayerId;
                            const isLit = isActive || playedPlayerIds.includes(pid);
                            const colors = getPlayerColorValues(pid);
                            
                            return (
                                <g key={sector.id}>
                                    <path 
                                        d={sector.path}
                                        fill="none"
                                        stroke={colors.main}
                                        strokeWidth={isActive ? 6 : (isLit ? 2 : 0)}
                                        strokeLinecap="round"
                                        filter={isActive ? "url(#rimGlow)" : ""}
                                        opacity={isLit ? 1 : 0}
                                        style={{ transition: 'all 0.5s ease-out' }}
                                    />
                                    <path 
                                        d={sector.path}
                                        fill="none"
                                        stroke="#2a1d15"
                                        strokeWidth="1"
                                        strokeLinecap="round"
                                    />
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>

            {/* 2. THE NEEDLE (Physical 3D Object) - UPDATED V2 (Exquisite Shape) */}
            <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none" 
                 style={{ 
                     transformStyle: 'preserve-3d', 
                     transform: 'translateZ(10px)' 
                 }}>
                 
                 <div className="relative transition-transform duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)" 
                      style={{ transform: `rotate(${rotation}deg)` }}>
                        
                        {/* Needle Shadow */}
                        <div className="absolute top-1/2 left-1/2 w-4 h-40 bg-black blur-sm opacity-60"
                             style={{ 
                                 transform: `translate(-50%, -50%) rotate(0deg) translateZ(-15px)`, 
                                 clipPath: 'polygon(50% 0%, 80% 40%, 50% 100%, 20% 40%)'
                             }}>
                        </div>

                        {/* Needle Main Body (Diamond Shape) */}
                        <div 
                            className="absolute top-1/2 left-1/2 w-6 h-48 -translate-x-1/2 -translate-y-[65%] transition-colors duration-700"
                            style={{ 
                                clipPath: 'polygon(50% 0%, 100% 85%, 50% 100%, 0% 85%)', // Diamond-like sword shape
                                background: `linear-gradient(90deg, ${activeColors.needle} 40%, white 50%, ${activeColors.needle} 60%)`, // Metallic ridge effect
                                boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                            }}
                        >
                        </div>

                        {/* Needle Counterweight (Tail) */}
                        <div 
                            className="absolute top-1/2 left-1/2 w-4 h-16 -translate-x-1/2 translate-y-[20%] transition-colors duration-700"
                            style={{ 
                                clipPath: 'polygon(50% 100%, 100% 15%, 50% 0%, 0% 15%)', 
                                background: `linear-gradient(90deg, #1a0505 40%, #3e2b22 50%, #1a0505 60%)` 
                            }}
                        >
                        </div>
                        
                        {/* Center Cap (Jewel) */}
                        <div 
                            className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full shadow-lg border-2 border-[#451a03] z-50 transition-colors duration-700 overflow-hidden"
                            style={{
                                background: `radial-gradient(circle at 30% 30%, white, ${activeColors.glow}, ${activeColors.needle})`
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent pointer-events-none"></div>
                        </div>
                 </div>
            </div>

            {/* 3. DIRECTION LABELS */}
            <div className="absolute inset-0 z-[25] pointer-events-none" style={{ transform: 'translateZ(15px)', opacity: isKaiChong ? 0.3 : 1, transition: 'opacity 1s' }}>
                 <div className={getTextClass(2)} style={{ top: '25%', left: '50%' }}>{getIdentityLabel(2, '北')}</div>
                 <div className={getTextClass(0)} style={{ top: '75%', left: '50%' }}>{getIdentityLabel(0, '南')}</div>
                 <div className={getTextClass(3)} style={{ top: '50%', left: '32%' }}>{getIdentityLabel(3, '西')}</div>
                 <div className={getTextClass(1)} style={{ top: '50%', left: '68%' }}>{getIdentityLabel(1, '東')}</div>
            </div>
        </div>
    );
});
