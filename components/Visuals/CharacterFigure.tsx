
import React, { useMemo } from 'react';
import { Player } from '../../types';
import { useSkin } from '../../contexts/SkinContext';
import { useGameSettings } from '../../hooks/useGameSettings';

interface CharacterFigureProps {
    player: Player;
    position: 'Top' | 'Left' | 'Right'; 
    isActive: boolean;
    isBanker: boolean;
    isBaiLao: boolean;
    statusText: string;
}

export const CharacterFigure: React.FC<CharacterFigureProps> = React.memo(({ player, position, isActive, isBanker, isBaiLao, statusText }) => {
    const { skin } = useSkin();
    const { graphicsQuality } = useGameSettings();
    const profile = player.profile;
    
    // Request a larger image if source allows
    const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/9.x/miniavs/svg?seed=${player.name}&backgroundColor=transparent`;

    let BodyComponent = skin.character.bodyFront;
    if (position === 'Left') BodyComponent = skin.character.bodySideLeft; 
    if (position === 'Right') BodyComponent = skin.character.bodySideRight;

    const robeColors = ['#8c1c0b', '#2b3e5c', '#5c4025', '#3e2b22'];
    let robeColor = robeColors[player.id % 4];

    if (position === 'Left' || position === 'Right') {
        robeColor = '#0F0F0F';
    }

    // --- VISUAL CORRECTION LOGIC ---
    const imageTransform = useMemo(() => {
        const gaze = profile?.gazeDirection || 'CENTER';
        let transform = 'scale(1.05) translateY(2%)'; 

        if (position === 'Left') {
            if (gaze === 'LEFT') return 'scaleX(-1) translateY(2%) scale(1.05)'; 
        }
        
        if (position === 'Right') {
            if (gaze === 'RIGHT') return 'scaleX(-1) translateY(2%) scale(1.05)';
        }

        return transform;
    }, [position, profile?.gazeDirection]);

    // --- CONFIGURATION BASED ON POSITION ---
    const config = useMemo(() => {
        const base = {
            chairScale: 'scale(1.1)',
            chairY: '0%',
            chairX: '0%', 
            bodyY: '8%',
            headScale: 1.0,
            headX: '50%',
            headY: '2%', 
            headRotateY: 0, 
            headRotateZ: 0,
            lightingGradient: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.25), rgba(0,0,0,0) 70%)',
            chinShadow: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 25%)', 
        };

        if (position === 'Top') {
            return {
                ...base,
                headY: '-5%', 
                headScale: 1.15,
                lightingGradient: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(0,0,0,0.5))',
            };
        }
        
        if (position === 'Left') {
            return {
                ...base,
                chairX: '5%',
                headX: '52%', 
                headY: '0%', 
                headScale: 1.08,
                headRotateY: 0, 
                headRotateZ: 2, 
                lightingGradient: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(255,255,255,0.2) 100%)',
            };
        }

        if (position === 'Right') {
            return {
                ...base,
                chairX: '-5%',
                headX: '48%', 
                headY: '0%', 
                headScale: 1.08,
                headRotateY: 0, 
                headRotateZ: -2,
                lightingGradient: 'linear-gradient(-90deg, rgba(0,0,0,0.7) 0%, rgba(255,255,255,0.2) 100%)',
            };
        }

        return base;
    }, [position]);

    const getStatusColor = (status: string) => {
        if (status === '赤脚') return 'bg-[#5c0b00] border-red-400 text-white shadow-[0_0_8px_rgba(220,38,38,0.6)]';
        if (status === '正本') return 'bg-[#1c1917] border-stone-400 text-stone-100 shadow-[0_0_8px_rgba(87,83,78,0.6)]';
        if (status === '得吊') return 'bg-[#064e3b] border-emerald-400 text-emerald-50 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
        if (status === '双吊') return 'bg-[#065f46] border-[#34d399] text-white shadow-[0_0_10px_rgba(52,211,153,0.8)]';
        return 'bg-black/90 border-stone-600';
    };

    const textFlipStyle = position === 'Top' ? { transform: 'rotateY(180deg)' } : undefined;

    return (
        <div 
            className={`
                relative w-96 h-96 flex items-end justify-center pointer-events-none 
                transition-all duration-700 ease-out select-none
                ${isActive ? 'z-50 filter brightness-110 drop-shadow-[0_0_25px_rgba(255,215,0,0.3)]' : 'opacity-95'}
            `} 
            style={{ 
                transformStyle: 'preserve-3d',
                transformOrigin: 'bottom center',
                transform: isActive ? 'scale(1.08) translateY(-5px)' : 'scale(1.0)'
            }}
        >
            <svg width="0" height="0" className="absolute">
                <defs>
                    <clipPath id="head-contour-clip" clipPathUnits="objectBoundingBox">
                        <path d="M 0.5, 0.02 C 0.85, 0.02, 1.0, 0.25, 1.0, 0.55 C 1.0, 0.75, 0.80, 0.92, 0.5, 0.98 C 0.20, 0.92, 0.0, 0.75, 0.0, 0.55 C 0.0, 0.25, 0.15, 0.02, 0.5, 0.02 Z" />
                    </clipPath>
                </defs>
            </svg>
            
            {/* LAYER 0: FLOOR SHADOW (Grounds the figure) */}
            <div className="absolute bottom-0 w-[80%] h-[10%] bg-black/80 blur-xl rounded-[100%] transform scale-y-50 -z-10 translate-y-4"></div>

            {/* LAYER 1: CHAIR */}
            <div 
                className="absolute bottom-[2%] z-0 origin-bottom filter brightness-[0.6] contrast-125 saturate-50 drop-shadow-2xl"
                style={{ 
                    transform: `translateZ(-20px) ${config.chairScale} translateX(${config.chairX}) translateY(${config.chairY})`,
                    width: '100%',  
                    height: '100%'  
                }}
            >
                <skin.character.chairComponent position={position} quality={graphicsQuality} />
            </div>

            {/* LAYER 2: HEAD */}
            <div 
                className="absolute z-[5] w-[35%] h-[35%]"
                style={{ 
                    left: config.headX,
                    top: config.headY,
                    transform: `translate(-50%, 0) scale(${config.headScale}) rotateY(${config.headRotateY}deg) rotateZ(${config.headRotateZ}deg)`,
                    transformOrigin: 'bottom center',
                    transformStyle: 'preserve-3d'
                }}
            >
                <div className="relative w-full h-full group">
                    <div 
                        className="w-full h-full relative overflow-hidden bg-[#dcd0b8]"
                        style={{
                            clipPath: 'url(#head-contour-clip)',
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.9)', 
                            maskImage: 'radial-gradient(circle at center, black 65%, transparent 100%)',
                            WebkitMaskImage: 'radial-gradient(circle at center, black 65%, transparent 100%)' 
                        }}
                    >
                        <img 
                            src={avatarUrl} alt="face" className="w-full h-full object-cover"
                            style={{ filter: 'sepia(0.2) contrast(1.15) saturate(1.1) brightness(0.95)', transform: imageTransform, imageRendering: '-webkit-optimize-contrast' }}
                        />
                        <div className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay" style={{ background: config.lightingGradient }}></div>
                        <div className="absolute inset-0 z-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-20 mix-blend-multiply"></div>
                        <div className="absolute bottom-0 left-0 w-full h-[40%] z-20 pointer-events-none mix-blend-multiply" style={{ background: config.chinShadow }}></div>
                    </div>
                </div>
            </div>

            {/* LAYER 3: BODY */}
            <div 
                className={`absolute bottom-3 z-10 w-full h-full flex items-end justify-center ${isActive && graphicsQuality === 'HIGH' ? 'animate-breathe-subtle' : ''}`} 
                style={{ transformOrigin: 'bottom center', transform: `translateY(${config.bodyY}) translateZ(5px)` }}
            >
                <div className="absolute bottom-2 w-[70%] h-4 bg-black/90 blur-md rounded-full transform scale-y-50"></div>
                <div className="relative w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] filter contrast-[1.15]">
                    <BodyComponent colorTheme={robeColor} quality={graphicsQuality} />
                    {(position === 'Left' || position === 'Right') && (
                        <div className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply rounded-[30%]"
                             style={{ background: position === 'Left' ? 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, transparent 40%, rgba(0,0,0,0.4) 100%)' : 'linear-gradient(-90deg, rgba(0,0,0,0.8) 0%, transparent 40%, rgba(0,0,0,0.4) 100%)' }}>
                        </div>
                    )}
                    
                    {/* STATUS BADGES */}
                    <div className="absolute top-[20%] w-full flex flex-col items-center justify-center z-40 pointer-events-none" 
                        style={{ transform: 'translateZ(30px) scale(0.35)', transformOrigin: 'top center', width: '300%', left: '-100%' }}>
                        <div className="flex flex-col gap-4 items-center justify-center w-full" style={textFlipStyle}>
                            {(isBanker || isBaiLao) && (
                                <div className="flex gap-6 items-center justify-center">
                                    {isBanker && (
                                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#aa1d1d] via-[#8c1c0b] to-[#450a0a] border-[6px] border-[#ffd700] shadow-[0_20px_40px_black] flex items-center justify-center text-[#fff] font-serif font-black text-7xl tracking-tighter ring-4 ring-black/40 z-10 animate-pulse-slow-opacity">
                                            <span className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] relative -top-1">庄</span>
                                        </div>
                                    )}
                                    {isBaiLao && (
                                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#eab308] via-[#ca8a04] to-[#713f12] border-[6px] border-[#fef08a] shadow-[0_20px_40px_black] flex items-center justify-center text-[#451a03] font-serif font-black text-7xl tracking-tighter ring-4 ring-black/40 z-10">
                                            <span className="drop-shadow-[0_2px_0_rgba(255,255,255,0.4)] relative -top-1">百</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {statusText && statusText !== '-' && (
                                <div className={`px-8 py-3 rounded-[12px] shadow-[0_15px_30px_rgba(0,0,0,0.9)] border-[4px] backdrop-blur-xl flex items-center h-24 mt-2 ${getStatusColor(statusText)}`}>
                                    <span className="text-6xl font-serif font-black tracking-widest drop-shadow-md whitespace-nowrap" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.6)' }}>
                                        {statusText}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isActive && graphicsQuality === 'HIGH' && (
                <div className="absolute inset-0 -z-10 bg-radial-gradient from-[#ffaa00]/15 to-transparent blur-3xl transform scale-125 translate-y-[-10%] mix-blend-screen animate-pulse-slow-opacity"></div>
            )}
        </div>
    );
});
