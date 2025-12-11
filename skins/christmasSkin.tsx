
import React from 'react';
import { ISkin, CardStyleProps } from '../types/skin';
import { LeadingEffectType, Suit, CardColor } from '../types';

const SnowAtmosphere: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0f1e]">
            {/* Dark Blue Night outside */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] via-[#120a0a] to-[#1a0f0f]"></div>
            
            {/* Fireplace Glow - Warm Orange, Bottom Left */}
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#ff5500] blur-[150px] opacity-10 animate-candleFlicker"></div>
            
            {/* Moonlight - Cold Blue, Top Right */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#aaddff] blur-[150px] opacity-05"></div>
            
            {/* Falling Snow */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] mix-blend-overlay"></div>
        </div>
    );
};

const ChristmasCardBack: React.FC<{ isSmall?: boolean }> = ({ isSmall }) => (
    <div className="absolute inset-0 w-full h-full rounded-[inherit] overflow-hidden bg-[#0d2e1a] flex items-center justify-center shadow-inner">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-60 mix-blend-multiply"></div>
         {/* Stitched Border */}
         <div className="absolute inset-1.5 border-2 border-dashed border-[#a38f6b] rounded-[4px] opacity-50"></div>
         {!isSmall && <div className="text-[#a38f6b] opacity-80 text-3xl">❄</div>}
    </div>
);

const ChristmasEffectOverlay: React.FC<{ effect: LeadingEffectType }> = ({ effect }) => {
    if (!effect) return null;
    return (
        <div className="absolute inset-0 z-20 pointer-events-none rounded-[inherit] ring-2 ring-[#ff0000] ring-opacity-50 animate-pulse"></div>
    );
};

// Simplified Cozy Character
const WoolBody: React.FC = () => <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl"><path d="M20,100 C20,60 30,35 50,35 C70,35 80,60 80,100 Z" fill="#8a1c1c" stroke="#330000" strokeWidth="1" /></svg>;
const PaddedChair: React.FC = () => <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M10,100 L10,30 Q50,20 90,30 L90,100" fill="#2d1b1b" /><rect x="15" y="35" width="70" height="60" fill="#143d22" rx="5" /></svg>;

export const ChristmasSkin: ISkin = {
    id: 'christmas',
    name: 'Cozy Winter (Velvet)',
    description: 'Green felt, warm candlelight, and holiday cheer.',

    layout: {
        backgroundClass: "bg-[#0a0f1e]",
        atmosphereComponent: SnowAtmosphere,
        // Green Felt Table
        tableSurfaceClass: "bg-[#143d22] rounded-[30px] shadow-[inset_0_0_100px_rgba(0,0,0,0.8),0_20px_60px_black] border-8 border-[#2d1b1b]",
        tableSurfaceStyle: {
            backgroundImage: `url('https://www.transparenttextures.com/patterns/felt.png'), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05) 0%, transparent 60%)`,
            backgroundBlendMode: 'overlay, normal',
            boxShadow: 'inset 0 0 150px #081a0e'
        },
        tableBorderClass: "bg-[#1f1212] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"
    },

    card: {
        getContainerClass: (props: CardStyleProps) => {
            let sizeClass = 'w-16 h-24 md:w-20 md:h-32';
            if (props.isSmall) sizeClass = props.isRotated ? 'w-14 h-10' : 'w-10 h-14';
            else if (props.isTrick) sizeClass = props.isRotated ? 'w-24 h-16 md:w-28 md:h-20' : 'w-16 h-24 md:w-20 md:h-28';
            else if (props.isHand) sizeClass = props.isRotated ? 'w-20 h-12 md:w-24 md:h-16' : 'w-14 h-22 md:w-20 md:h-32';

            // Warm off-white paper vs Dark Green back
            let bgClass = props.isInverted ? 'bg-[#2d1b1b]' : 'bg-[#fffaf0]';
            if (props.isFaceDown) bgClass = 'bg-[#0d2e1a]';
            if (props.isDisabled) bgClass = 'bg-gray-600 grayscale opacity-50';
            
            let hoverClass = 'transition-transform duration-300';
            if (!props.isFaceDown && !props.isHand && !props.isDisabled) {
                hoverClass += ' hover:-translate-y-2 hover:rotate-1 cursor-pointer hover:shadow-xl';
            }

            let transformClass = '';
            if (props.isSelected) transformClass = '-translate-y-4 scale-105 z-[100] ring-2 ring-[#c52222]';

            return `relative flex flex-col group rounded-[6px] ${sizeClass} ${bgClass} ${hoverClass} ${transformClass} shadow-md`;
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

        getBorderClass: (props: CardStyleProps) => {
            if (props.isFaceDown) return 'border-2 border-[#0a2012]';
            if (props.isWinner) return 'border-2 border-[#ffd700]';
            if (props.isSelected) return 'border-2 border-[#c52222]';
            return 'border border-gray-300';
        },

        getShadowClass: (props: CardStyleProps) => {
            if (props.isFaceDown) return 'shadow-lg';
            return 'shadow-[2px_2px_5px_rgba(0,0,0,0.2)]';
        },

        BackComponent: ChristmasCardBack,
        EffectOverlay: ChristmasEffectOverlay
    },

    hud: {
        avatarContainerClass: (isMyTurn) => `
            relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center 
            transition-all duration-500 border-4
            ${isMyTurn 
                ? 'bg-[#4a0e0e] border-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.5)] scale-105' 
                : 'bg-[#1e293b] border-[#334155] opacity-90'}
        `,
        buttonClass: (disabled) => `
            relative min-w-[150px] h-14 rounded-full flex items-center justify-center transition-all duration-300 font-bold tracking-wider text-sm shadow-xl
            ${!disabled 
                ? 'bg-gradient-to-b from-[#c52222] to-[#7f1d1d] text-white border-2 border-[#fecaca] hover:brightness-110' 
                : 'bg-[#334155] text-gray-400 border-2 border-[#475569] cursor-not-allowed'}
        `,
        modalOverlayClass: "fixed inset-0 z-[300] flex items-center justify-center bg-[#0a0f1e]/98 backdrop-blur-md p-4 animate-fade-in font-serif",
        modalContentClass: "bg-[#1a0f0f] border-4 border-[#c52222] p-8 w-full max-w-5xl rounded-[20px] shadow-2xl relative overflow-hidden text-[#fffaf0]"
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
