
import React from 'react';
import { ISkin, CardStyleProps } from '../types/skin';
import { LeadingEffectType, Suit, CardColor } from '../types';
import { TableBorderFlow } from '../components/Visuals/TableEffects';

// Suspended Gold Dust
const GOLD_DUST_PATTERN = "radial-gradient(circle, rgba(255,215,0,0.3) 1px, transparent 1px)"; 

const ImperialAtmosphere: React.FC<{ quality?: 'HIGH' | 'LOW' }> = ({ quality }) => (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#020101]">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#150505_0%,#000000_100%)]"></div>
         {quality !== 'LOW' && (
             <div className="absolute inset-0 opacity-20 animate-sway-slow mix-blend-screen" style={{ backgroundImage: GOLD_DUST_PATTERN, backgroundSize: '150px 150px' }}></div>
         )}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(0,0,0,0.9)_100%)]"></div>
    </div>
);

const ImperialCardBack: React.FC<{ isSmall?: boolean }> = ({ isSmall }) => (
    <div className="absolute inset-0 w-full h-full rounded-[inherit] overflow-hidden bg-[#050202] shadow-inner border border-[#333]">
         <div className="absolute inset-0 opacity-30" style={{ backgroundImage: GOLD_DUST_PATTERN, backgroundSize: '30px 30px' }}></div>
         <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/95"></div>
         <div className="absolute inset-1 border border-[#b8860b] rounded-[4px] opacity-40"></div>
         {!isSmall && (
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-8 h-12 border border-[#b8860b] flex items-center justify-center bg-black/60 backdrop-blur-sm shadow-[0_0_15px_#b8860b] animate-pulse-slow">
                    <span className="text-[#b8860b] font-serif font-bold text-lg drop-shadow-[0_0_5px_#b8860b] writing-vertical-rl">御</span>
                 </div>
             </div>
         )}
    </div>
);

const ImperialEffectOverlay: React.FC<{ effect: LeadingEffectType }> = ({ effect }) => {
    if (!effect) return null;
    return (
        <div className="absolute inset-0 z-30 rounded-[inherit] pointer-events-none overflow-hidden mix-blend-plus-lighter">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.2)_0%,transparent_70%)] animate-pulse-slow"></div>
            <div className="absolute inset-[-1px] border-[1.5px] border-[#ffd700] opacity-90 rounded-[inherit] shadow-[0_0_15px_#ffd700]"></div>
        </div>
    );
};

// --- DYNAMIC SHADOWS (THEATER/KABUKI) ---
const TheaterShadows: React.FC = () => (
    <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-soft-light overflow-hidden" style={{ zIndex: 1 }}>
        <svg viewBox="0 0 500 500" className="w-full h-full animate-actor-move" style={{ filter: 'blur(8px)' }}>
            {/* Abstract Dancer Silhouette */}
            <path d="M250,450 C200,450 150,350 150,250 C150,150 220,100 250,100 C280,100 350,150 350,250 C350,350 300,450 250,450 Z" fill="#000" />
            <circle cx="200" cy="200" r="40" fill="#000" /> {/* Fan or Sleeve */}
            <rect x="300" y="150" width="20" height="200" transform="rotate(15)" fill="#000" /> {/* Staff/Sword */}
        </svg>
    </div>
);

// ... Characters ...
const BodyFront: React.FC = () => <div className="w-full h-full bg-[#0a0505] opacity-60 blur-xl rounded-full"></div>; 
const ChairStub: React.FC = () => <div className="w-full h-full border-b-4 border-[#3e1010] opacity-50"></div>;

export const ImperialSkin: ISkin = {
    id: 'imperial',
    name: 'Imperial Court (Lacquer)',
    description: 'Deep Urushi lacquer with suspended gold dust (Maki-e).',

    layout: {
        backgroundClass: "bg-[#020101]",
        atmosphereComponent: ImperialAtmosphere,
        EnvironmentalShadows: TheaterShadows, // ADDED SHADOWS
        
        tableSurfaceClass: "rounded-[32px] shadow-[0_40px_100px_black] border border-[#3e1010]/60 overflow-hidden",
        
        // 1. SOLID BASE (Deepest Black)
        tableBaseColor: '#050202',
        
        // 2. TEXTURE (Gold Dust & Lacquer Depth)
        tableTexture: `
            radial-gradient(circle at 60% 30%, rgba(255,255,255,0.03) 0%, transparent 30%),
            radial-gradient(circle at 40% 70%, rgba(184, 134, 11, 0.05) 0%, transparent 50%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")
        `,
        tableTextureSize: 'auto',
        tableReflectivity: true, // Enable Mirror Finish

        tableBorderClass: "bg-[#0f0505] border-t border-[#3e1010]/40"
    },

    card: {
        getContainerClass: (props: CardStyleProps) => {
            let sizeClass = 'w-16 h-24 md:w-20 md:h-32';
            if (props.isSmall) sizeClass = props.isRotated ? 'w-12 h-8' : 'w-8 h-12';
            else if (props.isTrick) sizeClass = props.isRotated ? 'w-20 h-14 md:w-28 md:h-20' : 'w-14 h-20 md:w-20 md:h-28';
            else if (props.isHand) sizeClass = props.isRotated ? 'w-24 h-16 md:w-28 md:h-20' : 'w-16 h-24 md:w-24 md:h-36'; 
            let bgClass = props.isInverted ? 'bg-[#080404] text-[#e6c278] border border-[#3e1010]' : 'bg-[#f7f2e6] text-[#1c1917]'; 
            if (props.isFaceDown) bgClass = 'bg-[#050202]';
            if (props.isDisabled) bgClass = 'bg-[#1a1a1a] grayscale opacity-40';
            let hoverClass = 'transition-all duration-300 cubic-bezier(0.2, 0.8, 0.2, 1)'; 
            if (!props.isFaceDown && !props.isHand && !props.isDisabled) { hoverClass += ' hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8)] cursor-pointer hover:brightness-110'; }
            let transformClass = ''; if (props.isSelected) transformClass = '-translate-y-4 scale-105 z-[100] shadow-[0_0_30px_rgba(218,165,32,0.6)] ring-1 ring-[#daa520]';
            return `relative flex flex-col group rounded-[6px] ${sizeClass} ${bgClass} ${hoverClass} ${transformClass}`;
        },
        getMainColorClass: (color, isInverted) => {
            if (isInverted) return 'text-[#d4af37] font-serif tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'; 
            if (color === CardColor.RED) return 'text-[#9f1212] font-bold opacity-90 mix-blend-multiply'; 
            if (color === CardColor.GREEN) return 'text-[#0f5132] font-bold opacity-90 mix-blend-multiply'; 
            return 'text-[#0a0a0a] font-bold opacity-90 mix-blend-multiply'; 
        },
        getPokerColorClass: (suit, isInverted) => {
            if (isInverted) return 'text-[#b8860b]';
            const isRedSuit = suit === Suit.STRINGS || suit === Suit.TEXTS;
            return isRedSuit ? 'text-[#9f1212]' : 'text-[#0a0a0a]';
        },
        getBorderClass: (props: CardStyleProps) => {
            if (props.isFaceDown) return 'border border-[#3e1010]';
            if (props.isWinner) return 'border border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.6)]';
            return 'border-[0.5px] border-[#ccc]/30'; 
        },
        getShadowClass: (props: CardStyleProps) => {
            if (props.isFaceDown) return 'shadow-[0_10px_20px_black]'; 
            return 'shadow-[0_2px_8px_rgba(0,0,0,0.3)]'; 
        },
        BackComponent: ImperialCardBack,
        EffectOverlay: ImperialEffectOverlay
    },

    hud: {
        avatarContainerClass: (isMyTurn) => `
            relative w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center 
            transition-all duration-700
            ${isMyTurn 
                ? 'bg-[#150505] border-2 border-[#FFD700] shadow-[0_0_50px_rgba(255,215,0,0.5)] scale-110 z-50 ring-1 ring-[#b8860b]' 
                : 'bg-[#0a0202] border border-[#3e1010] opacity-70 grayscale-[0.5] scale-90'}
        `,
        buttonClass: (disabled) => `
            relative min-w-[140px] h-12 rounded-[4px] flex items-center justify-center transition-all duration-300 font-serif tracking-[0.3em] font-bold text-sm shadow-[0_10px_30px_rgba(0,0,0,0.9)]
            ${!disabled 
                ? 'bg-gradient-to-br from-[#2b0d0d] via-[#4a1212] to-[#1a0505] text-[#ffdb7a] border border-[#d4af37] hover:brightness-125 hover:-translate-y-1 active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.2)] backdrop-blur-md' 
                : 'bg-[#0f0505] text-[#555] border border-[#333] cursor-not-allowed opacity-50'}
        `,
        modalOverlayClass: "fixed inset-0 z-[300] flex items-center justify-center bg-[#000000]/98 backdrop-blur-xl p-4 animate-fade-in font-serif",
        modalContentClass: `relative w-full max-w-5xl bg-[#050202] border-[1px] border-[#3e1010] shadow-[0_0_150px_rgba(139,0,0,0.5)] text-[#e6c278] rounded-[4px]`
    },

    lighting: {
        StoveLighting: () => null, 
        TableBorderFlow: TableBorderFlow
    },

    character: {
        bodyFront: BodyFront,
        bodySideLeft: BodyFront,
        bodySideRight: BodyFront,
        headOutline: '',
        chairComponent: ChairStub
    }
};
