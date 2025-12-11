
import React from 'react';
import { ISkin, CardStyleProps } from '../types/skin';
import { LeadingEffectType, Suit, CardColor } from '../types';

const MingAtmosphere: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#150f0a]">
            {/* Warm Scholar's Studio Lighting - Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#2c1e16_20%,#080402_100%)]"></div>
            
            {/* Candle Flicker Top Right */}
            <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-[#ffaa55] opacity-5 blur-[120px] rounded-full animate-candleFlicker"></div>
            
            {/* Wood Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 mix-blend-overlay"></div>
        </div>
    );
};

const MingCardBack: React.FC<{ isSmall?: boolean }> = ({ isSmall }) => (
    <div className="absolute inset-0 w-full h-full rounded-[inherit] overflow-hidden bg-[#3d2314] flex items-center justify-center shadow-inner">
        {/* Fine Wood Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-60 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/70"></div>
        
        {/* Carved Border */}
        <div className="absolute inset-1.5 border border-[#8c6239] rounded-[2px] opacity-80 shadow-[inset_0_0_2px_rgba(0,0,0,0.8)]"></div>
        
        {!isSmall && (
            <div className="relative z-10 w-10 h-16 bg-[#5c1a1a] shadow-[1px_1px_3px_rgba(0,0,0,0.6)] flex items-center justify-center rounded-[2px] opacity-95 border border-[#8c6239]/30">
                <span className="text-[#e8e4d9] font-serif font-bold text-2xl writing-vertical-rl tracking-widest drop-shadow-md opacity-90">明</span>
            </div>
        )}
    </div>
);

const MingEffectOverlay: React.FC<{ effect: LeadingEffectType }> = ({ effect }) => {
    if (!effect) return null;
    return (
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none z-[50]">
            <div className="absolute -inset-[3px] border-2 border-[#d4af37] border-double rounded-[inherit] opacity-60 animate-pulse"></div>
        </div>
    );
};

// ... Simplified Character Assets for brevity, style matches Ming ...
const BodyFront: React.FC = () => <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl filter sepia-[0.3] brightness-75"><path d="M25,100 C25,75 35,45 50,45 C65,45 75,75 75,100 Z" fill="#8c6239" /></svg>;
const BodySide: React.FC = () => <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl filter sepia-[0.3] brightness-75"><path d="M35,100 C35,75 45,40 60,45 C70,50 70,100 70,100 Z" fill="#8c6239" /></svg>;
const Chair: React.FC = () => <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M10,100 L10,25 Q50,15 90,25 L90,100" fill="none" stroke="#2b1810" strokeWidth="4" /></svg>;

export const MingSkin: ISkin = {
    id: 'ming_scholar',
    name: 'Ming Scholar (Wood)',
    description: 'Polished Huanghuali wood, brass fittings, and Xuan paper.',

    layout: {
        backgroundClass: "bg-[#1a120b]", 
        atmosphereComponent: MingAtmosphere,
        // Huanghuali Table: polished, reddish-brown
        tableSurfaceClass: "bg-[#3d2314] shadow-[inset_0_0_150px_rgba(0,0,0,0.9),0_30px_80px_black] border-[6px] border-[#2b1810] rounded-[8px]",
        tableSurfaceStyle: {
            backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05), transparent 70%),
                url('https://www.transparenttextures.com/patterns/wood-pattern.png')
            `,
            backgroundSize: 'cover, 400px',
            backgroundBlendMode: 'soft-light, multiply'
        },
        tableBorderClass: "bg-[#1f1008] border-t border-[#5c3a21]/50 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"
    },

    card: {
        getContainerClass: (props: CardStyleProps) => {
            let sizeClass = 'w-16 h-24 md:w-20 md:h-32';
            if (props.isSmall) sizeClass = props.isRotated ? 'w-14 h-10' : 'w-10 h-14';
            else if (props.isTrick) sizeClass = props.isRotated ? 'w-24 h-16 md:w-28 md:h-20' : 'w-16 h-24 md:w-20 md:h-28';
            else if (props.isHand) sizeClass = props.isRotated ? 'w-20 h-12 md:w-24 md:h-16' : 'w-14 h-22 md:w-20 md:h-32';

            // Antique Xuan Paper
            let bgClass = props.isInverted ? 'bg-[#2b1f18]' : 'bg-[#e6dccf]'; 
            if (props.isFaceDown) bgClass = 'bg-[#2b1810]'; 
            if (props.isDisabled) bgClass = 'bg-[#a39e93] grayscale opacity-80';

            let hoverClass = 'transition-transform duration-200 ease-out';
            if (!props.isFaceDown && !props.isHand && !props.isDisabled) {
                hoverClass += ' hover:-translate-y-1 hover:shadow-lg cursor-pointer hover:rotate-1';
            }

            let transformClass = '';
            if (props.isSelected) transformClass = '-translate-y-4 z-[100] ring-1 ring-[#8c6239]';

            return `relative flex flex-col group rounded-[2px] ${sizeClass} ${bgClass} ${hoverClass} ${transformClass}`;
        },
        getMainColorClass: (color, isInverted) => {
            if (isInverted) return 'text-[#d9c7b0] font-serif';
            // Faded Ink
            if (color === CardColor.RED) return 'text-[#8f1f1f] font-serif font-bold opacity-80 mix-blend-multiply'; 
            if (color === CardColor.GREEN) return 'text-[#1e4a2e] font-serif font-bold opacity-80 mix-blend-multiply'; 
            return 'text-[#1a1a1a] font-serif font-bold opacity-90 mix-blend-multiply'; 
        },
        getPokerColorClass: (suit, isInverted) => {
            if (isInverted) return 'text-[#d9c7b0]';
            const isRedSuit = suit === Suit.STRINGS || suit === Suit.TEXTS;
            return isRedSuit ? 'text-[#8f1f1f]' : 'text-[#1a1a1a]';
        },
        getBorderClass: (props) => {
            let borderClass = props.isInverted ? 'border-[#5c4025]' : 'border-[#d1cbb8]';
            if (props.isFaceDown) borderClass = 'border-[#1f1008]'; 
            if (props.isWinner) return 'border-2 border-[#d4af37]';
            if (props.isSelected) return 'border-2 border-[#8c6239]';
            return `border ${borderClass}`;
        },
        getShadowClass: (props) => {
            if (props.isFaceDown) return 'shadow-[2px_2px_6px_rgba(0,0,0,0.8)]'; 
            return 'shadow-[1px_1px_3px_rgba(0,0,0,0.3)]'; 
        },
        BackComponent: MingCardBack,
        EffectOverlay: MingEffectOverlay
    },

    hud: {
        avatarContainerClass: (isMyTurn) => `
            relative w-20 h-20 md:w-24 md:h-24 rounded-sm flex items-center justify-center 
            transition-all duration-500 border-4 border-[#5c3a21]
            ${isMyTurn 
                ? 'bg-[#3d2314] shadow-[0_0_25px_rgba(140,98,57,0.4)] scale-105 z-50 ring-2 ring-[#d4af37]' 
                : 'bg-[#1a0f0a] opacity-90'}
        `,
        buttonClass: (disabled) => `
            relative min-w-[150px] h-14 flex items-center justify-center transition-all duration-200 font-serif tracking-[0.2em] rounded-[2px] text-sm font-bold shadow-lg
            ${!disabled 
                ? 'bg-[#8c6239] text-[#2b1810] border-b-4 border-[#5c3a21] active:border-b-0 active:translate-y-1 hover:bg-[#a67c52]' 
                : 'bg-[#3d2b23] text-[#5c4a40] border-b-4 border-[#2b1e18] cursor-not-allowed'}
        `,
        modalOverlayClass: "fixed inset-0 z-[300] flex items-center justify-center bg-[#0f0502]/98 backdrop-blur-md p-4 animate-fade-in font-serif",
        modalContentClass: `
            relative w-full max-w-5xl bg-[#1a120b] 
            border-[4px] border-[#3d1e11] 
            rounded-[4px] shadow-[0_0_100px_black]
            text-[#d9c7b0]
            bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]
        `
    },

    lighting: {
        StoveLighting: () => null, 
        TableBorderFlow: () => null 
    },

    character: {
        bodyFront: BodyFront,
        bodySideLeft: BodySide,
        bodySideRight: BodySide,
        headOutline: '',
        chairComponent: Chair
    }
};
