
import React from 'react';
import { ISkin, CardStyleProps } from '../types/skin';
import { LeadingEffectType, Suit, CardColor } from '../types';

const FABRIC_PATTERN = "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)";

const SnowAtmosphere: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#050a14]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#050a14] via-[#0f0a0a] to-[#1a0505]"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#ff4500] blur-[180px] opacity-15 animate-candleFlicker mix-blend-screen"></div>
            <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] bg-[#aaddff] blur-[120px] opacity-05 rounded-full"></div>
            <div className="absolute inset-0 opacity-10 mix-blend-overlay animate-sway-slow" style={{ backgroundImage: FABRIC_PATTERN, backgroundSize: '10px 10px' }}></div>
        </div>
    );
};

const ChristmasCardBack: React.FC<{ isSmall?: boolean }> = ({ isSmall }) => (
    <div className="absolute inset-0 w-full h-full rounded-[inherit] overflow-hidden bg-[#0a2e18] flex items-center justify-center shadow-inner">
         <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: FABRIC_PATTERN, backgroundSize: '4px 4px' }}></div>
         <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/60"></div>
         <div className="absolute inset-1.5 border-2 border-dashed border-[#c5a059] rounded-[4px] opacity-60"></div>
         {!isSmall && <div className="text-[#c5a059] opacity-80 text-4xl drop-shadow-md">❄</div>}
    </div>
);

const ChristmasEffectOverlay: React.FC<{ effect: LeadingEffectType }> = ({ effect }) => {
    if (!effect) return null;
    return (
        <div className="absolute inset-0 z-20 pointer-events-none rounded-[inherit] ring-4 ring-[#b91c1c] ring-opacity-60 animate-pulse shadow-[0_0_20px_#b91c1c]"></div>
    );
};

// ... Characters ...
const WoolBody: React.FC = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
        <path d="M20,100 C20,60 30,35 50,35 C70,35 80,60 80,100 Z" fill="#8a1c1c" stroke="#330000" strokeWidth="1" />
        <path d="M50,35 L50,100" stroke="rgba(0,0,0,0.2)" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
);
const PaddedChair: React.FC<{ position?: string }> = ({ position }) => {
    return <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M10,100 L10,30 Q50,20 90,30 L90,100" fill="#3e2723" /><rect x="15" y="35" width="70" height="60" fill="#143d22" rx="5" stroke="#0a2012" strokeWidth="2" /></svg>;
};

export const ChristmasSkin: ISkin = {
    id: 'christmas',
    name: 'Victorian Parlor (Velvet)',
    description: 'Aged green velvet, dark mahogany, warm firelight.',

    layout: {
        backgroundClass: "bg-[#050a14]",
        atmosphereComponent: SnowAtmosphere,
        
        tableSurfaceClass: "rounded-[30px] shadow-[inset_0_0_80px_black,0_30px_80px_black] border-[12px] border-[#2d1b1b] overflow-hidden",
        
        // 1. SOLID BASE
        tableBaseColor: '#0f2e1c',
        
        // 2. TEXTURE
        tableTexture: FABRIC_PATTERN,
        tableTextureSize: '4px 4px',
        
        tableBorderClass: "bg-[#1a0f0f]"
    },

    card: {
        getContainerClass: (props: CardStyleProps) => {
            let sizeClass = 'w-16 h-24 md:w-20 md:h-32';
            if (props.isSmall) sizeClass = props.isRotated ? 'w-14 h-10' : 'w-10 h-14';
            else if (props.isTrick) sizeClass = props.isRotated ? 'w-24 h-16 md:w-28 md:h-20' : 'w-16 h-24 md:w-20 md:h-28';
            else if (props.isHand) sizeClass = props.isRotated ? 'w-20 h-12 md:w-24 md:h-16' : 'w-14 h-22 md:w-20 md:h-32';
            let bgClass = props.isInverted ? 'bg-[#3e2723] text-[#e6c278]' : 'bg-[#fffaf0] text-[#1e293b]';
            if (props.isFaceDown) bgClass = 'bg-[#0a2e18]';
            if (props.isDisabled) bgClass = 'bg-gray-600 grayscale opacity-50';
            let hoverClass = 'transition-transform duration-300';
            if (!props.isFaceDown && !props.isHand && !props.isDisabled) { hoverClass += ' hover:-translate-y-2 hover:rotate-1 cursor-pointer hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)]'; }
            let transformClass = ''; if (props.isSelected) transformClass = '-translate-y-4 scale-105 z-[100] ring-2 ring-[#c52222] shadow-[0_20px_30px_rgba(0,0,0,0.6)]';
            return `relative flex flex-col group rounded-[6px] ${sizeClass} ${bgClass} ${hoverClass} ${transformClass}`;
        },
        getMainColorClass: (color, isInverted) => {
            if (isInverted) return 'text-[#f0e68c] font-serif';
            if (color === CardColor.RED) return 'text-[#b91c1c] font-bold'; 
            if (color === CardColor.GREEN) return 'text-[#15803d] font-bold'; 
            return 'text-[#1e293b] font-bold'; 
        },
        getPokerColorClass: (suit, isInverted) => {
            if (isInverted) return 'text-[#f0e68c]';
            const isRedSuit = suit === Suit.STRINGS || suit === Suit.TEXTS;
            return isRedSuit ? 'text-[#b91c1c]' : 'text-[#1e293b]';
        },
        getBorderClass: (props) => {
            if (props.isFaceDown) return 'border-2 border-[#051a0d]';
            if (props.isWinner) return 'border-2 border-[#ffd700]';
            if (props.isSelected) return 'border-2 border-[#c52222]';
            return 'border border-gray-300';
        },
        getShadowClass: (props) => {
            if (props.isFaceDown) return 'shadow-lg';
            return 'shadow-[1px_2px_4px_rgba(0,0,0,0.3)]';
        },
        BackComponent: ChristmasCardBack,
        EffectOverlay: ChristmasEffectOverlay
    },

    hud: {
        avatarContainerClass: (isMyTurn) => `
            relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center 
            transition-all duration-500 border-4 border-[#3e2723]
            ${isMyTurn 
                ? 'bg-[#4a0e0e] border-[#ffd700] shadow-[0_0_25px_rgba(255,215,0,0.4)] scale-105' 
                : 'bg-[#1e293b] opacity-90'}
        `,
        buttonClass: (disabled) => `
            relative min-w-[150px] h-14 rounded-full flex items-center justify-center transition-all duration-300 font-bold tracking-wider text-sm shadow-xl
            ${!disabled 
                ? 'bg-gradient-to-b from-[#c52222] to-[#7f1d1d] text-white border border-[#fecaca] hover:brightness-110 shadow-[0_5px_15px_rgba(185,28,28,0.4)]' 
                : 'bg-[#334155] text-gray-400 border border-[#475569] cursor-not-allowed'}
        `,
        modalOverlayClass: "fixed inset-0 z-[300] flex items-center justify-center bg-[#050a14]/98 backdrop-blur-md p-4 animate-fade-in font-serif",
        modalContentClass: "bg-[#1a0f0f] border-[6px] border-[#2d1b1b] p-8 w-full max-w-5xl rounded-[12px] shadow-2xl relative overflow-hidden text-[#fffaf0]"
    },

    lighting: {
        StoveLighting: () => null,
        TableBorderFlow: () => null
    },

    character: {
        bodyFront: WoolBody,
        bodySideLeft: WoolBody,
        bodySideRight: WoolBody,
        headOutline: '',
        chairComponent: PaddedChair
    }
};
