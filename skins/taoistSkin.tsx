
import React from 'react';
import { ISkin, CardStyleProps } from '../types/skin';
import { LeadingEffectType, Suit, CardColor } from '../types';

const INK_PATTERN = "linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.02) 75%, rgba(255,255,255,0.02))";

const TaoistAtmosphere: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#e0e4e8]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#f0f4f8] via-[#cfd8dc] to-[#b0bec5]"></div>
            {/* Ink drop diffusion */}
            <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle,rgba(0,0,0,0.03)_0%,transparent_70%)] blur-[80px]"></div>
            <div className="absolute inset-0 opacity-20 mix-blend-multiply animate-sway-slow" style={{ backgroundImage: INK_PATTERN, backgroundSize: '40px 40px' }}></div>
        </div>
    );
};

const TaoistCardBack: React.FC<{ isSmall?: boolean }> = ({ isSmall }) => (
    <div className="absolute inset-0 w-full h-full rounded-[inherit] overflow-hidden bg-[#1a1a1a] flex items-center justify-center border border-[#444]">
        <div className="absolute inset-0 bg-[#0f0f0f]"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: INK_PATTERN, backgroundSize: '4px 4px' }}></div>
        {/* Tai Chi Symbol Abstract */}
        <div className={`relative ${isSmall ? 'scale-50' : 'scale-75'} opacity-80 mix-blend-screen`}>
            <div className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                <div className="w-6 h-12 bg-white/90 rounded-l-full border-r border-black"></div>
                <div className="w-6 h-12 bg-black rounded-r-full border-l border-white/90"></div>
            </div>
        </div>
    </div>
);

const TaoistEffectOverlay: React.FC<{ effect: LeadingEffectType }> = ({ effect }) => {
    if (!effect) return null;
    return (
        <div className="absolute inset-[-12px] pointer-events-none z-[10]">
            <div className="absolute inset-0 rounded-full blur-xl bg-black/10 animate-pulse transform scale-90"></div>
            <div className="absolute inset-2 border border-black/30 rounded-[inherit] opacity-60"></div>
        </div>
    );
};

// ... Characters ...
const InkBody: React.FC = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        <filter id="ink-blur"><feGaussianBlur in="SourceGraphic" stdDeviation="1.0" /></filter>
        <path d="M20,100 C20,50 40,40 50,40 C60,40 80,50 80,100 Z" fill="#111" filter="url(#ink-blur)" opacity="0.9" />
    </svg>
);
const StoneChair: React.FC<{ position?: string }> = ({ position }) => {
    return ( <svg viewBox="0 0 100 100" className="w-full h-full"> <rect x="20" y="40" width="60" height="60" fill="#2a2a2a" rx="1" /> <rect x="15" y="35" width="70" height="5" fill="#444" /> </svg> );
};

export const TaoistSkin: ISkin = {
    id: 'taoist_mystery',
    name: 'Taoist Void (Ink Stone)',
    description: 'Cold inkstone slab, rice paper, ethereal mist.',

    layout: {
        backgroundClass: "bg-[#cfd8dc]",
        atmosphereComponent: TaoistAtmosphere,
        
        tableSurfaceClass: "shadow-[0_40px_120px_rgba(0,0,0,0.5)] border border-[#455a64] rounded-[40px] overflow-hidden",
        
        // 1. SOLID BASE (Slate Grey)
        tableBaseColor: '#263238',
        
        // 2. TEXTURE (Stone Noise)
        tableTexture: `
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E"),
            linear-gradient(to bottom right, #37474f, #263238)
        `,
        tableTextureSize: 'auto',
        
        tableBorderClass: "bg-[#1c2529] border-t border-[#455a64]"
    },

    card: {
        getContainerClass: (props: CardStyleProps) => {
            let sizeClass = 'w-16 h-24 md:w-20 md:h-32';
            if (props.isSmall) sizeClass = props.isRotated ? 'w-14 h-10' : 'w-10 h-14';
            else if (props.isTrick) sizeClass = props.isRotated ? 'w-24 h-16 md:w-28 md:h-20' : 'w-16 h-24 md:w-20 md:h-28';
            else if (props.isHand) sizeClass = props.isRotated ? 'w-20 h-12 md:w-24 md:h-16' : 'w-14 h-22 md:w-20 md:h-32';
            
            // Rice Paper look
            let bgClass = props.isInverted ? 'bg-[#111] text-[#ddd]' : 'bg-[#fcfcfc] text-[#111]';
            if (props.isFaceDown) bgClass = 'bg-[#0f0f0f]';
            if (props.isDisabled) bgClass = 'bg-[#999] opacity-50 grayscale';
            
            let hoverClass = 'transition-all duration-500 ease-out';
            if (!props.isFaceDown && !props.isHand && !props.isDisabled) { hoverClass += ' hover:-translate-y-2 hover:shadow-2xl cursor-pointer hover:scale-105'; }
            let transformClass = ''; if (props.isSelected) transformClass = '-translate-y-4 z-[100] scale-105 shadow-[0_15px_30px_rgba(0,0,0,0.3)]';
            return `relative flex flex-col group rounded-[2px] ${sizeClass} ${bgClass} ${hoverClass} ${transformClass}`;
        },
        getMainColorClass: (color, isInverted) => {
            if (isInverted) return 'text-[#ccc] font-calligraphy tracking-widest'; 
            if (color === CardColor.RED) return 'text-[#b71c1c] font-bold font-calligraphy opacity-90'; 
            return 'text-[#212121] font-bold font-calligraphy opacity-95'; 
        },
        getPokerColorClass: (suit, isInverted) => {
            if (isInverted) return 'text-[#ccc]';
            const isRedSuit = suit === Suit.STRINGS || suit === Suit.TEXTS;
            return isRedSuit ? 'text-[#b71c1c]' : 'text-[#212121]';
        },
        getBorderClass: (props) => {
            if (props.isFaceDown) return 'border border-[#333]';
            if (props.isWinner) return 'border-[2px] border-black'; 
            if (props.isSelected) return 'border-[1px] border-black';
            return 'border border-transparent';
        },
        getShadowClass: (props) => {
            if (props.isFaceDown) return 'shadow-[0_5px_15px_rgba(0,0,0,0.8)]';
            return 'shadow-[2px_2px_8px_rgba(0,0,0,0.1)]';
        },
        BackComponent: TaoistCardBack,
        EffectOverlay: TaoistEffectOverlay
    },

    hud: {
        avatarContainerClass: (isMyTurn) => `
            relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center 
            transition-all duration-1000 border
            ${isMyTurn 
                ? 'bg-black border-white shadow-[0_0_50px_rgba(0,0,0,0.3)] scale-105 z-50' 
                : 'bg-white border-black opacity-80 grayscale'}
        `,
        buttonClass: (disabled) => `
            relative min-w-[140px] h-14 flex items-center justify-center transition-all duration-500 font-calligraphy tracking-[0.3em] rounded-full text-sm font-bold shadow-lg
            ${!disabled 
                ? 'bg-[#263238] text-white border border-transparent hover:bg-[#37474f]' 
                : 'bg-[#b0bec5] text-[#546e7a] cursor-not-allowed'}
        `,
        modalOverlayClass: "fixed inset-0 z-[300] flex items-center justify-center bg-[#eceff1]/95 backdrop-blur-md p-4 animate-fade-in font-serif",
        modalContentClass: "bg-[#fafafa] border border-[#cfd8dc] p-8 w-full max-w-5xl rounded-[2px] shadow-2xl relative overflow-hidden text-[#263238]"
    },

    lighting: {
        StoveLighting: () => null,
        TableBorderFlow: () => null
    },

    character: {
        bodyFront: InkBody,
        bodySideLeft: InkBody,
        bodySideRight: InkBody,
        headOutline: '',
        chairComponent: StoneChair
    }
};
