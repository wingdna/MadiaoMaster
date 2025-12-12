
import React, { useMemo } from 'react';
import { Card as CardType, Suit, SuitStatus, LeadingEffectType, CardRank, CardColor } from '../types';
import { useSkin } from '../contexts/SkinContext';

const PAPER_URI = "data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' opacity='0.15'/%3E%3C/svg%3E";

interface LanternGlowConfig {
    color?: string;
    secondaryColor?: string; 
    intensity?: number;
}

interface CardProps {
  card: CardType;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onTouchStart?: (event: React.TouchEvent<HTMLDivElement>) => void;
  isSelected?: boolean;
  isSmall?: boolean;
  isTrick?: boolean;
  isHand?: boolean;
  isFaceDown?: boolean;
  isInverted?: boolean; 
  isRotated?: boolean; 
  isBanker?: boolean; 
  isBaiLao?: boolean; 
  isSuspectedBaiLao?: boolean;
  isMature?: boolean; 
  isForbidden?: boolean; 
  isDraggable?: boolean;
  isSuggested?: boolean; 
  isDisabled?: boolean;
  isLocked?: boolean; // NEW: Disables interactive hover effects (lift/scale) without graying out
  isWinner?: boolean; 
  leadingEffect?: LeadingEffectType; 
  domId?: string; 
  className?: string;
  style?: React.CSSProperties;
  suitStatus?: SuitStatus;
  textLayout?: 'vertical' | 'horizontal'; 
  textRotation?: number; 
  lanternGlow?: LanternGlowConfig | null; 
}

const getPokerDisplay = (val: number) => val.toString();

const getModernSuit = (suit: Suit): string => {
    switch (suit) {
        case Suit.CASH: return '♠';
        case Suit.STRINGS: return '♥';
        case Suit.COINS: return '♣';
        case Suit.TEXTS: return '♦';
        default: return '';
    }
};

const CardBase: React.FC<CardProps> = (props) => {
  const { card, onClick, onTouchStart, style, domId, textRotation = 0, isRotated = false, lanternGlow, isLocked } = props;
  const { skin } = useSkin();

  const isVerticalText = props.textLayout ? props.textLayout === 'vertical' : !isRotated; 

  if (!card) return null;

  const containerClass = skin.card.getContainerClass(props);
  const mainColorClass = skin.card.getMainColorClass(card.color, props.isInverted);
  const cornerColorClass = skin.card.getMainColorClass(card.color, props.isInverted);

  // TYPOGRAPHY TUNING
  let mainFontSize = isVerticalText ? 'text-2xl md:text-4xl' : 'text-xl md:text-3xl';
  if (props.isSmall) mainFontSize = 'text-[9px] leading-tight'; 
  if (props.isTrick) mainFontSize = isVerticalText ? 'text-3xl md:text-5xl font-black tracking-widest' : 'text-2xl md:text-4xl font-black'; 

  const indexFontSize = props.isSmall ? 'text-[7px]' : 'text-[10px] md:text-sm font-black'; 
  const suitFontSize = props.isSmall ? 'text-[7px]' : 'text-[9px] md:text-xs font-bold'; 
  
  const rotationStyle = textRotation ? { transform: `rotate(${textRotation}deg)` } : {};

  // LAYOUT
  let contentLayoutClass = '';
  if (props.isSmall) {
      contentLayoutClass = 'absolute inset-0 flex flex-col items-center justify-center pt-3 pb-1';
  } else if (isVerticalText) {
      contentLayoutClass = 'absolute inset-0 flex flex-col items-center justify-center pt-5 pb-2 px-1 gap-0.5'; 
  } else {
      contentLayoutClass = 'absolute inset-0 flex flex-row items-center justify-center px-4 py-2 gap-1';
  }

  let cornerPosClass = 'top-[3px] left-[3px]';
  if (textRotation === 180) {
      cornerPosClass = 'bottom-[3px] right-[3px] transform rotate-180';
  }

  // 3D THICKNESS & MATERIAL LOGIC
  const THICKNESS_PX = props.isSmall ? 1 : 2; 
  
  let edgeColor = '#dcdcdc'; 
  let invertedBg = '#1a1a1a'; 

  if (skin.id === 'imperial') {
      edgeColor = '#b8860b'; 
      invertedBg = '#0a0505'; 
  } else if (skin.id === 'ming_scholar') {
      edgeColor = '#a8a499';
      invertedBg = '#26140c';
  }

  // Engraved Text Effect
  const engravedTextStyle = {
      ...rotationStyle,
      // Simulate letterpress impression
      textShadow: props.isInverted 
        ? '0 1px 1px rgba(0,0,0,0.8)' 
        : 'inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.5)', 
      mixBlendMode: props.isInverted ? 'normal' : 'multiply'
  };

  const CardFaceContent = () => (
      <div className="w-full h-full rounded-[inherit] overflow-hidden relative">
          
          {/* Inner Glow (Lantern Effect) */}
          {lanternGlow && (
              <div 
                  className="absolute inset-0 z-[5] pointer-events-none rounded-[inherit] animate-pulse-fast"
                  style={{
                      boxShadow: `inset 0 0 15px ${lanternGlow.color}`,
                      mixBlendMode: 'plus-lighter', // Changed to plus-lighter for better visibility
                      opacity: lanternGlow.intensity || 0.6
                  }}
              />
          )}

          {!props.isFaceDown && (
              <>
                  {/* BACKGROUND LAYER */}
                  {!props.isInverted ? (
                      <div className="absolute inset-0 bg-[#f0eee5] z-0"></div>
                  ) : (
                      <div className="absolute inset-0 z-0" style={{ backgroundColor: invertedBg }}></div>
                  )}
                  
                  {/* Texture */}
                  <div className="absolute inset-0 opacity-100 pointer-events-none mix-blend-multiply z-0" style={{ backgroundImage: `url("${PAPER_URI}")` }}></div>
                  
                  {/* Fine Hairline at edge */}
                  <div className={`absolute inset-0 border-[1px] ${props.isInverted ? 'border-[#5c4025]' : 'border-[#2c1a12]'} rounded-[inherit] pointer-events-none z-50 opacity-40`}></div>

                  {/* Main Text */}
                  <div className={`z-10 ${contentLayoutClass}`}>
                      <div className={`${mainColorClass} ${mainFontSize} font-calligraphy select-none whitespace-nowrap ${isVerticalText ? 'tategaki' : ''} transition-all overflow-visible`} 
                          style={engravedTextStyle as any}>
                          {card.name}
                      </div>
                  </div>

                  {/* Corner Index */}
                  <div className={`absolute ${cornerPosClass} z-30 flex flex-col items-center justify-center pointer-events-none origin-center`}>
                      <div className={`flex flex-col items-center leading-none opacity-80`}>
                          <span className={`block ${indexFontSize} ${cornerColorClass} font-serif`}>{getPokerDisplay(card.value)}</span>
                          <span className={`block ${suitFontSize} ${cornerColorClass}`}>{getModernSuit(card.suit)}</span>
                      </div>
                  </div>

                  {/* Badges */}
                  {props.isBanker && (
                      <div className="absolute top-1.5 right-1.5 z-30" style={rotationStyle}>
                          <div className="w-3.5 h-3.5 rounded-full bg-[#8c1c0b] border border-[#f59e0b] flex items-center justify-center shadow-md">
                              <span className="text-[8px] text-[#fff] font-serif leading-none pt-[1px]">庄</span>
                          </div>
                      </div>
                  )}
                  {/* V22 Update: Bai Lao Badge moved to Right-Bottom to clear space for Suit Status */}
                  {(props.isBaiLao || props.isSuspectedBaiLao) && (
                      <div className="absolute bottom-1.5 right-1.5 z-30" style={rotationStyle}>
                          <div className={`w-3.5 h-3.5 rounded-full ${props.isSuspectedBaiLao ? 'bg-amber-700' : 'bg-amber-600'} border border-[#3e2b22] flex items-center justify-center shadow-md`}>
                              <span className="text-[8px] text-[#e8e4d9] font-serif leading-none pt-[1px]">百</span>
                          </div>
                      </div>
                  )}

                  {/* V22 Update: Suit Status Indicator moved to Left-Bottom */}
                  {props.suitStatus && props.suitStatus !== 'NEUTRAL' && (
                      <div className="absolute bottom-1.5 left-1.5 z-30" style={rotationStyle}>
                          <div className={`w-2.5 h-2.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.6)] ${
                              props.suitStatus === 'FORBIDDEN' 
                                ? 'bg-[#b91c1c] border border-[#ef4444] shadow-[0_0_5px_rgba(220,38,38,0.5)] animate-pulse-slow' 
                                : 'bg-[#15803d] border border-[#4ade80] shadow-[0_0_5px_rgba(74,222,128,0.5)]'
                          }`} title={props.suitStatus === 'FORBIDDEN' ? 'Jin Men (Forbidden)' : 'Shu Men (Safe)'}></div>
                      </div>
                  )}

                  <skin.card.EffectOverlay effect={props.leadingEffect || (props.isWinner ? 'GOLD' : null)} />
                  
                  {/* Selection Highlight */}
                  {props.isSelected && (
                      <div className="absolute inset-0 rounded-[inherit] z-50 pointer-events-none ring-2 ring-white/90 shadow-[0_0_20px_rgba(255,255,255,0.6)]"></div>
                  )}
              </>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 opacity-30 pointer-events-none mix-blend-overlay rounded-[inherit] z-40"></div>
      </div>
  );

  return (
    <div id={domId} 
         className={`${containerClass} relative aspect-[2/3] ${skin.card.getBorderClass(props)} ${skin.card.getShadowClass(props)} ${isLocked ? '!cursor-default !transform-none !transition-none pointer-events-none' : ''}`} 
         style={{ transformStyle: 'preserve-3d', ...style }} 
         onClick={props.isDisabled || isLocked ? undefined : onClick} 
         onTouchStart={props.isDisabled || isLocked ? undefined : onTouchStart}
    >
      {/* OUTER LANTERN GLOW (Backdrop Bloom) */}
      {lanternGlow && (
          <div 
              className="absolute inset-[-15px] z-0 rounded-[inherit] animate-pulse-slow pointer-events-none"
              style={{
                  background: `radial-gradient(circle at 50% 50%, ${lanternGlow.color} 0%, transparent 70%)`,
                  opacity: lanternGlow.intensity || 0.8,
                  filter: 'blur(10px)',
                  transform: 'translateZ(-5px)'
              }}
          />
      )}

      <div className="absolute inset-0 backface-hidden z-20 rounded-[inherit]" 
           style={{ transform: `translateZ(${THICKNESS_PX}px)` }}>
          <CardFaceContent />
      </div>

      {[1, 2].map(i => (
          <div key={`edge-${i}`} 
               className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
               style={{ 
                   background: edgeColor, 
                   transform: `translateZ(${THICKNESS_PX - i * 0.5}px)`, 
                   boxShadow: `0 0 1px ${edgeColor}` 
               }}>
          </div>
      ))}
      
      <div className="absolute inset-0 backface-hidden z-20 rounded-[inherit]" 
           style={{ transform: `rotateY(180deg) translateZ(${THICKNESS_PX}px)` }}>
          <div className="w-full h-full rounded-[inherit] overflow-hidden relative bg-[#050303] p-[1px]">
              <skin.card.BackComponent isSmall={props.isSmall} />
              <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
          </div>
      </div>
    </div>
  );
};

// --- ARCHITECTURAL OPTIMIZATION ---
// Use strict equality for props to avoid re-renders of static cards in the discard pile.
export default React.memo(CardBase, (prev, next) => {
    return (
        prev.card.id === next.card.id &&
        prev.isSelected === next.isSelected &&
        prev.isFaceDown === next.isFaceDown &&
        prev.isDisabled === next.isDisabled &&
        prev.isSuggested === next.isSuggested &&
        prev.isWinner === next.isWinner &&
        prev.isInverted === next.isInverted &&
        prev.lanternGlow === next.lanternGlow &&
        // Ignore style changes unless position changes significantly (optimization for small jitter)
        prev.style?.transform === next.style?.transform
    );
});
