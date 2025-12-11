
import React from 'react';
import { ISkin, CardStyleProps } from '../types/skin';
import { LeadingEffectType, Suit, CardColor } from '../types';
import { TableBorderFlow } from '../components/Visuals/TableEffects';

const ImperialAtmosphere: React.FC<{ quality?: 'HIGH' | 'LOW' }> = ({ quality }) => (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#020101]">
         {/* Deep Lacquer Base */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#1a0505_0%,#000000_100%)] opacity-100"></div>
         
         {/* Gold Dust */}
         {quality !== 'LOW' && (
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-color-dodge animate-sway-slow" style={{ backgroundSize: '400px' }}></div>
         )}
         
         <div className="absolute top-[-20%] left-[50%] w-[40%] h-[120%] bg-gradient-to-b from-[#ffd700] to-transparent opacity-[0.03] transform -translate-x-1/2 rotate-12 blur-3xl pointer-events-none"></div>
    </div>
);

const ImperialCardBack: React.FC<{ isSmall?: boolean }> = ({ isSmall }) => (
    <div className="absolute inset-0 w-full h-full rounded-[inherit] overflow-hidden bg-[#0a0505] shadow-inner border border-[#3d1010]">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-40 mix-blend-overlay scale-75"></div>
         <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
         <div className="absolute inset-1.5 border border-[#C5A059] rounded-[4px] opacity-80 shadow-[0_0_10px_rgba(197,160,89,0.3)]"></div>
         {!isSmall && (
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-10 h-10 rounded-full border border-[#C5A059] flex items-center justify-center bg-black/60 backdrop-blur-sm shadow-[0_0_15px_#C5A059]">
                    <span className="text-[#C5A059] font-serif font-bold text-xl drop-shadow-[0_0_5px_#C5A059]">御</span>
                 </div>
             </div>
         )}
    </div>
);

const ImperialEffectOverlay: React.FC<{ effect: LeadingEffectType }> = ({ effect }) => {
    if (!effect) return null;
    return (
        <div className="absolute inset-0 z-30 rounded-[inherit] pointer-events-none overflow-hidden mix-blend-overlay">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.5)_0%,transparent_70%)] animate-pulse-slow"></div>
            <div className="absolute inset-0 border-2 border-[#ffd700] opacity-50 rounded-[inherit]"></div>
        </div>
    );
};

// ... Characters (Simplified) ...
const BodyFront: React.FC = () => <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl"><path d="M35,25 Q50,20 65,25 L75,40 Q85,60 85,100 L15,100 Q15,60 25,40 Z" fill="#5c0b00" /></svg>;
const BodySide: React.FC = () => <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl"><path d="M35,20 Q25,30 20,100 L90,100 Q85,60 65,30 Z" fill="#2a0500" /></svg>;
const Chair: React.FC = () => <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M10,100 L5,20 Q50,0 95,20 L90,100" fill="#1a0502" /></svg>;

export const ImperialSkin: ISkin = {
    id: 'imperial',
    name: 'Imperial Court (Maki-e)',
    description: 'Black lacquer (Urushi), gold dust, and deep shadows.',

    layout: {
        backgroundClass: "bg-[#050202]",
        atmosphereComponent: ImperialAtmosphere,
        tableSurfaceClass: "bg-[#0a0505] border-[2px] border-[#5c1010] rounded-[24px] shadow-[0_50px_150px_black]",
        tableSurfaceStyle: {
            backgroundImage: `radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05) 0%, transparent 60%), url('https://www.transparenttextures.com/patterns/black-scales.png'), linear-gradient(180deg, #150505 0%, #000000 100%)`,
            backgroundBlendMode: 'normal, overlay, normal',
            boxShadow: 'inset 0 0 120px rgba(0,0,0,1), 0 0 60px rgba(0,0,0,0.8)'
        },
        tableBorderClass: "bg-[#2b0a0a] border-t border-[#8c2020]/30 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"
    },

    card: {
        getContainerClass: (props: CardStyleProps) => {
            let sizeClass = 'w-16 h-24 md:w-20 md:h-32';
            if (props.isSmall) sizeClass = props.isRotated ? 'w-14 h-10' : 'w-10 h-14';
            else if (props.isTrick) sizeClass = props.isRotated ? 'w-20 h-12 md:w-28 md:h-20' : 'w-12 h-20 md:w-20 md:h-28';
            else if (props.isHand) sizeClass = props.isRotated ? 'w-20 h-12 md:w-24 md:h-16' : 'w-14 h-24 md:w-20 md:h-32'; 

            // INVERTED = DEEP BLACK
            let bgClass = props.isInverted ? 'bg-[#0a0a0a]' : 'bg-[#f7f2e6]'; 
            if (props.isFaceDown) bgClass = 'bg-[#0a0505]';
            if (props.isDisabled) bgClass = 'bg-stone-800 grayscale opacity-40';
            
            let hoverClass = 'transition-transform duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)'; 
            if (!props.isFaceDown && !props.isHand && !props.isDisabled) {
                hoverClass += ' hover:-translate-y-3 hover:shadow-2xl cursor-pointer hover:brightness-110';
            }

            let transformClass = '';
            if (props.isSelected) transformClass = '-translate-y-6 scale-110 z-[100] shadow-[0_20px_60px_rgba(0,0,0,0.9)] ring-1 ring-[#c5a059]';

            return `relative flex flex-col group rounded-md ${sizeClass} ${bgClass} ${hoverClass} ${transformClass}`;
        },

        getMainColorClass: (color, isInverted) => {
            if (isInverted) return 'text-[#e6c278] font-serif tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'; // Antique Gold
            if (color === CardColor.RED) return 'text-[#8a1c1c] drop-shadow-sm font-bold opacity-90';
            if (color === CardColor.GREEN) return 'text-[#14532d] drop-shadow-sm font-bold opacity-90';
            return 'text-[#1c1917] font-bold opacity-90'; 
        },

        getPokerColorClass: (suit, isInverted) => {
            if (isInverted) return 'text-[#b8860b]';
            const isRedSuit = suit === Suit.STRINGS || suit === Suit.TEXTS;
            return isRedSuit ? 'text-[#8a1c1c]' : 'text-[#1c1917]';
        },

        getBorderClass: (props: CardStyleProps) => {
            if (props.isFaceDown) return 'border border-[#3d1010]';
            if (props.isWinner) return 'border border-[#d4af37] shadow-[0_0_15px_#d4af37]';
            if (props.isSelected) return 'border-none'; 
            return 'border border-[#e6dccf]'; 
        },

        getShadowClass: (props: CardStyleProps) => {
            if (props.isFaceDown) return 'shadow-[0_10px_25px_black]'; 
            return 'shadow-[0_5px_15px_rgba(0,0,0,0.3)]'; 
        },

        BackComponent: ImperialCardBack,
        EffectOverlay: ImperialEffectOverlay
    },

    hud: {
        avatarContainerClass: (isMyTurn) => `
            relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center 
            transition-all duration-700
            ${isMyTurn 
                ? 'bg-gradient-to-b from-[#3d0e0e] to-[#000] border-2 border-[#FFD700] shadow-[0_0_50px_rgba(255,215,0,0.6)] scale-110 z-50' 
                : 'bg-[#0f0505] border border-[#3e2b22] opacity-80 grayscale-[0.3]'}
        `,
        buttonClass: (disabled) => `
            relative min-w-[160px] h-14 rounded-sm flex items-center justify-center transition-all duration-300 font-serif tracking-[0.3em] font-bold text-sm shadow-[0_10px_30px_rgba(0,0,0,0.8)]
            ${!disabled 
                ? 'bg-gradient-to-b from-[#2b180d] via-[#3d2213] to-[#1a0f0a] text-[#e6c278] border-y border-[#8c6239] hover:brightness-125 hover:-translate-y-1 active:scale-95' 
                : 'bg-[#1a1a1a] text-[#555] border border-[#333] cursor-not-allowed'}
        `,
        modalOverlayClass: "fixed inset-0 z-[300] flex items-center justify-center bg-[#050202]/98 backdrop-blur-xl p-4 animate-fade-in font-serif",
        modalContentClass: `relative w-full max-w-5xl bg-[#0a0606] border-y border-[#5c1010] shadow-[0_0_150px_black] text-[#e6c278] rounded-sm bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]`
    },

    lighting: {
        StoveLighting: () => null,
        TableBorderFlow: TableBorderFlow
    },

    character: {
        bodyFront: BodyFront,
        bodySideLeft: BodySide,
        bodySideRight: BodySide,
        headOutline: '',
        chairComponent: Chair
    }
};
