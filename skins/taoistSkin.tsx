
import React from 'react';
import { ISkin, CardStyleProps } from '../types/skin';
import { LeadingEffectType, Suit, CardColor } from '../types';

const TaoistAtmosphere: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#e5e5e5]">
            {/* Foggy Void - Gray to White */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#f0f0f0] to-[#cccccc]"></div>
            
            {/* Dynamic Ink Drops / Smoke */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/shattered-island.png')] mix-blend-multiply animate-sway-slow"></div>
            
            {/* Heavy Vignette for focus */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#000000_100%)] opacity-20"></div>
        </div>
    );
};

const TaoistCardBack: React.FC<{ isSmall?: boolean }> = ({ isSmall }) => (
    <div className="absolute inset-0 w-full h-full rounded-[inherit] overflow-hidden bg-[#111] flex items-center justify-center border border-[#333]">
        <div className="absolute inset-0 bg-[#050505]"></div>
        {/* Rough paper grain */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        
        {/* Spinning Tai Chi Symbol */}
        <div className={`relative ${isSmall ? 'scale-50' : 'scale-75'} opacity-60`}>
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                <div className="w-6 h-12 bg-white rounded-l-full border-r border-black"></div>
                <div className="w-6 h-12 bg-black rounded-r-full border-l border-white"></div>
            </div>
        </div>
    </div>
);

const TaoistEffectOverlay: React.FC<{ effect: LeadingEffectType }> = ({ effect }) => {
    if (!effect) return null;
    return (
        <div className="absolute inset-[-8px] pointer-events-none z-[10]">
            <div className="absolute inset-0 rounded-full blur-md bg-black/10 animate-pulse"></div>
            <div className="absolute inset-0 border border-black/30 rounded-[inherit] opacity-50"></div>
        </div>
    );
};

// Simplified Character for Taoist - Abstract Ink Blob
const InkBody: React.FC = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        <filter id="ink-blur"><feGaussianBlur in="SourceGraphic" stdDeviation="1" /></filter>
        <path d="M20,100 C20,50 40,40 50,40 C60,40 80,50 80,100 Z" fill="#111" filter="url(#ink-blur)" opacity="0.9" />
    </svg>
);
const StoneChair: React.FC = () => <svg viewBox="0 0 100 100" className="w-full h-full"><rect x="20" y="40" width="60" height="60" fill="#333" /></svg>;


export const TaoistSkin: ISkin = {
    id: 'taoist_mystery',
    name: 'Taoist Void (Ink)',
    description: 'Black ink on white paper, high contrast, ethereal.',

    layout: {
        backgroundClass: "bg-[#e5e5e5]",
        atmosphereComponent: TaoistAtmosphere,
        // Matte Stone Slab
        tableSurfaceClass: "bg-[#1a1a1a] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-[#333] rounded-[40px]",
        tableSurfaceStyle: {
            backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05), transparent 60%), url('https://www.transparenttextures.com/patterns/concrete-wall.png')`,
            backgroundBlendMode: 'overlay',
            boxShadow: 'inset 0 0 100px #000'
        },
        tableBorderClass: "bg-[#0a0a0a] border-t border-[#333]"
    },

    card: {
        getContainerClass: (props: CardStyleProps) => {
            let sizeClass = 'w-16 h-24 md:w-20 md:h-32';
            if (props.isSmall) sizeClass = props.isRotated ? 'w-14 h-10' : 'w-10 h-14';
            else if (props.isTrick) sizeClass = props.isRotated ? 'w-24 h-16 md:w-28 md:h-20' : 'w-16 h-24 md:w-20 md:h-28';
            else if (props.isHand) sizeClass = props.isRotated ? 'w-20 h-12 md:w-24 md:h-16' : 'w-14 h-22 md:w-20 md:h-32';

            // High Contrast: White paper vs Black Ink
            let bgClass = props.isInverted ? 'bg-[#111] text-[#ccc]' : 'bg-[#fff] text-black';
            if (props.isFaceDown) bgClass = 'bg-[#000]';
            if (props.isDisabled) bgClass = 'bg-[#aaa] opacity-50 grayscale';

            let hoverClass = 'transition-all duration-500 ease-out';
            if (!props.isFaceDown && !props.isHand && !props.isDisabled) {
                hoverClass += ' hover:-translate-y-2 hover:shadow-2xl cursor-pointer hover:scale-105';
            }

            let transformClass = '';
            if (props.isSelected) transformClass = '-translate-y-4 z-[100] scale-105 shadow-xl';

            return `relative flex flex-col group rounded-[2px] ${sizeClass} ${bgClass} ${hoverClass} ${transformClass}`;
        },

        getMainColorClass: (color, isInverted) => {
            if (isInverted) return 'text-[#ccc] font-calligraphy'; 
            // Only Red and Black in Ink Wash style
            if (color === CardColor.RED) return 'text-[#990000] font-bold font-calligraphy opacity-90'; 
            return 'text-[#000000] font-bold font-calligraphy opacity-90'; 
        },

        getPokerColorClass: (suit, isInverted) => {
            if (isInverted) return 'text-[#ccc]';
            const isRedSuit = suit === Suit.STRINGS || suit === Suit.TEXTS;
            return isRedSuit ? 'text-[#990000]' : 'text-[#000]';
        },

        getBorderClass: (props) => {
            if (props.isFaceDown) return 'border border-[#222]';
            if (props.isWinner) return 'border-2 border-black'; 
            if (props.isSelected) return 'border-2 border-black';
            return 'border border-transparent';
        },

        getShadowClass: (props) => {
            if (props.isFaceDown) return 'shadow-[0_5px_15px_rgba(0,0,0,0.8)]';
            return 'shadow-[2px_2px_5px_rgba(0,0,0,0.2)]';
        },

        BackComponent: TaoistCardBack,
        EffectOverlay: TaoistEffectOverlay
    },

    hud: {
        avatarContainerClass: (isMyTurn) => `
            relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center 
            transition-all duration-1000 border
            ${isMyTurn 
                ? 'bg-black border-white/50 shadow-[0_0_40px_rgba(0,0,0,0.5)] scale-105 z-50' 
                : 'bg-white border-black/20 opacity-80 grayscale'}
        `,
        buttonClass: (disabled) => `
            relative min-w-[140px] h-14 flex items-center justify-center transition-all duration-500 font-calligraphy tracking-[0.3em] rounded-full text-sm font-bold shadow-lg
            ${!disabled 
                ? 'bg-black text-white border border-transparent hover:bg-white hover:text-black hover:border-black' 
                : 'bg-[#ccc] text-[#888] cursor-not-allowed'}
        `,
        modalOverlayClass: "fixed inset-0 z-[300] flex items-center justify-center bg-[#000]/95 backdrop-blur-md p-4 animate-fade-in font-serif",
        modalContentClass: "bg-[#111] border border-[#333] p-8 w-full max-w-5xl rounded-[2px] shadow-2xl relative overflow-hidden text-[#e0e0e0] bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')]"
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
