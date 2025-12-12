
import React from 'react';
import { ISkin, CardStyleProps } from '../types/skin';
import { LeadingEffectType, Suit, CardColor } from '../types';

const MingAtmosphere: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#0a0604]">
            {/* Dark, warm ambient enclosure */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#2d1a10_0%,#050202_90%)]"></div>
            {/* Subtle dust particles */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-overlay"></div>
        </div>
    );
};

const MingCardBack: React.FC<{ isSmall?: boolean }> = ({ isSmall }) => (
    <div className="absolute inset-0 w-full h-full rounded-[inherit] overflow-hidden bg-[#26140c] flex items-center justify-center shadow-inner border border-[#3e2b22]">
        {/* Wood Texture on Back */}
        <div className="absolute inset-0 opacity-40" 
             style={{ 
                 background: `
                    repeating-radial-gradient(circle at 0 0, transparent 0, #26140c 10px),
                    repeating-linear-gradient(45deg, #3e2b22, #26140c 10px, #3e2b22 20px)
                 ` 
             }}>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 to-transparent"></div>
        {!isSmall && (
            <div className="relative z-10 w-8 h-20 border-[1px] border-[#8c6239]/40 flex items-center justify-center rounded-[2px] bg-[#3d1e11]/90 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.8)] animate-pulse-slow">
                <span className="text-[#e6c278] font-serif font-bold text-2xl writing-vertical-rl tracking-widest drop-shadow-[0_1px_2px_black] opacity-90 select-none">明</span>
            </div>
        )}
    </div>
);

const MingEffectOverlay: React.FC<{ effect: LeadingEffectType }> = ({ effect }) => {
    if (!effect) return null;
    return (
        <div className="absolute inset-[-4px] rounded-[inherit] pointer-events-none z-[50]">
            <div className="absolute inset-0 border-[1px] border-[#d4af37] rounded-[inherit] opacity-60 animate-pulse shadow-[0_0_15px_#d4af37,inset_0_0_10px_#d4af37]"></div>
        </div>
    );
};

// --- DYNAMIC SHADOWS (BAMBOO/BANANA LEAVES) ---
const BambooShadows: React.FC = () => (
    <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply overflow-hidden" style={{ zIndex: 1 }}>
        <svg viewBox="0 0 500 500" className="w-full h-full animate-shadow-sway origin-bottom-left" style={{ filter: 'blur(4px)' }}>
            <g transform="rotate(45) translate(100, -100)">
                {/* Bamboo Stalks */}
                <rect x="50" y="0" width="10" height="600" fill="#1a0f0a" />
                <rect x="150" y="0" width="8" height="600" fill="#1a0f0a" />
                
                {/* Leaves */}
                <ellipse cx="60" cy="100" rx="60" ry="10" transform="rotate(30)" fill="#1a0f0a" />
                <ellipse cx="160" cy="200" rx="70" ry="12" transform="rotate(-20)" fill="#1a0f0a" />
                <ellipse cx="60" cy="300" rx="50" ry="8" transform="rotate(45)" fill="#1a0f0a" />
                <ellipse cx="160" cy="400" rx="80" ry="15" transform="rotate(-10)" fill="#1a0f0a" />
            </g>
        </svg>
        {/* Warm Sunset Projection Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#ff8c00]/10 to-transparent mix-blend-overlay"></div>
    </div>
);

// ... Characters ...
const BodyFront: React.FC = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] filter contrast-125 sepia-[0.3]">
        <defs>
            <filter id="silkFlow"><feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
        </defs>
        <path d="M20,100 L20,50 Q50,40 80,50 L80,100 Z" fill="#2d1a10" stroke="none" filter="url(#silkFlow)" opacity="0.9" />
    </svg>
);
const Chair: React.FC<{ position?: string }> = ({ position }) => {
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
            <path d="M15,100 L15,30 Q15,10 50,15 Q85,10 85,30 L85,100" fill="none" stroke="#3e2723" strokeWidth="6" strokeLinecap="round" />
            <path d="M20,100 L20,40 L80,40 L80,100" fill="#26140c" opacity="0.8" />
        </svg>
    );
};

export const MingSkin: ISkin = {
    id: 'ming_scholar',
    name: 'Ming Scholar (Huanghuali)',
    description: 'Aged Huanghuali wood with ghost face grains and deep amber patina.',

    layout: {
        backgroundClass: "bg-[#0a0604]", 
        atmosphereComponent: MingAtmosphere,
        EnvironmentalShadows: BambooShadows, // ADDED SHADOWS
        
        tableSurfaceClass: "rounded-[12px] overflow-hidden shadow-[0_50px_120px_black] border border-[#5c3a21]/50",
        
        // 1. SOLID BASE COLOR (Deep Reddish Brown)
        tableBaseColor: '#2b1105', 
        
        // 2. TEXTURE (Ghost Face Pattern & Grain)
        tableTexture: `
            radial-gradient(circle at 30% 40%, rgba(20, 10, 5, 0.4) 0%, transparent 60%),
            repeating-linear-gradient(110deg, rgba(62, 39, 35, 0.1) 0px, rgba(62, 39, 35, 0.1) 1px, transparent 1px, transparent 8px),
            radial-gradient(ellipse at 70% 60%, rgba(139, 69, 19, 0.15), transparent 40%),
            conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(0,0,0,0.2) 20deg, transparent 40deg)
        `,
        tableTextureSize: 'auto',
        
        // Enable Patina/Reflection layer in Scene3D
        tableReflectivity: true, 

        tableBorderClass: "bg-[#1a0a05] border-t border-[#3e2b22] brightness-75"
    },

    card: {
        getContainerClass: (props: CardStyleProps) => {
            let sizeClass = 'w-16 h-24 md:w-20 md:h-32';
            if (props.isSmall) sizeClass = props.isRotated ? 'w-14 h-10' : 'w-10 h-14';
            else if (props.isTrick) sizeClass = props.isRotated ? 'w-24 h-14 md:w-32 md:h-20' : 'w-14 h-24 md:w-20 md:h-32';
            else if (props.isHand) sizeClass = props.isRotated ? 'w-20 h-12 md:w-24 md:h-16' : 'w-14 h-24 md:w-20 md:h-32'; 
            
            // Aged Paper / Woodblock Print Look
            let bgClass = props.isInverted 
                ? 'bg-[#26140c] text-[#d9c7b0] border border-[#5c3a21]' 
                : 'bg-[#e8e4d9] text-[#2b1810]'; 
            
            if (props.isFaceDown) bgClass = 'bg-[#26140c]';
            if (props.isDisabled) bgClass = 'bg-[#1a1a1a] opacity-40 grayscale';
            
            let hoverClass = 'transition-all duration-300 ease-out';
            if (!props.isFaceDown && !props.isHand && !props.isDisabled) { 
                hoverClass += ' hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.7)] cursor-pointer hover:brightness-110'; 
            }
            
            let transformClass = ''; 
            if (props.isSelected) transformClass = '-translate-y-4 scale-105 z-[100] shadow-[0_0_30px_rgba(217,199,176,0.4)]';
            
            return `relative flex flex-col group rounded-[4px] ${sizeClass} ${bgClass} ${hoverClass} ${transformClass}`;
        },
        getMainColorClass: (color, isInverted) => {
            if (isInverted) return 'text-[#d9c7b0] font-serif tracking-widest opacity-90 drop-shadow-sm'; 
            if (color === CardColor.RED) return 'text-[#8c1c0b] font-bold font-calligraphy opacity-90 mix-blend-multiply'; 
            if (color === CardColor.GREEN) return 'text-[#2e4c2e] font-bold font-calligraphy opacity-95 mix-blend-multiply'; 
            return 'text-[#1a1a1a] font-bold font-calligraphy opacity-90 mix-blend-multiply'; 
        },
        getPokerColorClass: (suit, isInverted) => {
            if (isInverted) return 'text-[#c5a059]';
            const isRedSuit = suit === Suit.STRINGS || suit === Suit.TEXTS;
            return isRedSuit ? 'text-[#8c1c0b]' : 'text-[#1a1a1a]';
        },
        getBorderClass: (props) => {
            if (props.isFaceDown) return 'border border-[#3e2b22]';
            if (props.isWinner) return 'border-[2px] border-[#d4af37]';
            if (props.isSelected) return 'border-[1px] border-[#8c6239]';
            return 'border-[0.5px] border-[#a8a499]/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.05)]';
        },
        getShadowClass: (props) => {
            if (props.isFaceDown) return 'shadow-[0_4px_10px_rgba(0,0,0,0.8)]'; 
            return 'shadow-[1px_2px_6px_rgba(0,0,0,0.3)]';
        },
        BackComponent: MingCardBack,
        EffectOverlay: MingEffectOverlay
    },

    hud: {
        avatarContainerClass: (isMyTurn) => `
            relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center 
            transition-all duration-700 border-[3px] 
            ${isMyTurn 
                ? 'bg-[#2b1105] border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.3)] scale-105 z-50 ring-2 ring-[#5c3a21]/50' 
                : 'bg-[#1a0a05] border-[#3e2b22] opacity-80 sepia-[0.4]'}
        `,
        buttonClass: (disabled) => `
            relative min-w-[150px] h-14 rounded-[2px] flex items-center justify-center transition-all duration-300 font-serif tracking-[0.25em] font-bold shadow-lg text-sm
            ${!disabled 
                ? 'bg-gradient-to-b from-[#3e2b22] to-[#26140c] text-[#d9c7b0] border border-[#5c4025] hover:border-[#d4af37] hover:text-[#fff] shadow-[0_5px_15px_rgba(0,0,0,0.5)]' 
                : 'bg-[#1a1a1a] text-[#444] border border-[#333] cursor-not-allowed'}
        `,
        modalOverlayClass: "fixed inset-0 z-[300] flex items-center justify-center bg-[#050302]/95 backdrop-blur-xl p-4 animate-fade-in font-serif",
        modalContentClass: "bg-[#1a0d08] border border-[#3e2b22] p-8 w-full max-w-5xl rounded-[2px] shadow-[0_0_100px_black] relative overflow-hidden text-[#d9c7b0] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"
    },

    lighting: {
        StoveLighting: () => null,
        TableBorderFlow: () => null
    },

    character: {
        bodyFront: BodyFront,
        bodySideLeft: BodyFront,
        bodySideRight: BodyFront,
        headOutline: '',
        chairComponent: Chair
    }
};
