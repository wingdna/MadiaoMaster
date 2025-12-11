
import React, { useMemo } from 'react';
import { Card as CardType, Suit, SuitStatus, LeadingEffectType, CardRank } from '../types';
import { useSkin } from '../contexts/SkinContext';

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
  isWinner?: boolean; 
  leadingEffect?: LeadingEffectType; 
  isSuggested?: boolean; 
  isDisabled?: boolean;
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
  const { card, onClick, onTouchStart, style, domId, textRotation = 0, isRotated = false, lanternGlow } = props;
  const { skin } = useSkin();

  const isVerticalText = props.textLayout ? props.textLayout === 'vertical' : !isRotated; 

  if (!card) return null;

  const containerClass = skin.card.getContainerClass(props);
  const mainColorClass = skin.card.getMainColorClass(card.color, props.isInverted);
  const pokerColorClass = skin.card.getPokerColorClass(card.suit, props.isInverted);

  let mainFontSize = isVerticalText ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl';
  if (props.isSmall) mainFontSize = 'text-[10px]';
  if (props.isTrick) mainFontSize = isVerticalText ? 'text-2xl tracking-[0.1em]' : 'text-3xl font-bold'; 

  const indexFontSize = props.isSmall ? 'text-[9px]' : 'text-base md:text-lg font-black'; 
  const suitFontSize = props.isSmall ? 'text-[8px]' : 'text-[10px] md:text-xs font-bold'; 
  const indexPadding = props.isSmall ? 'px-0.5 py-0' : 'px-1 py-0'; 
  const indexFlexClass = isVerticalText ? 'flex-col' : 'flex-row gap-1 items-center';

  const rotationStyle = textRotation ? { transform: `rotate(${textRotation}deg)` } : {};

  // PREVENT OVERLAP
  let contentLayoutClass = '';
  if (props.isSmall) {
      contentLayoutClass = 'absolute inset-0 flex flex-col items-center justify-center pt-5 pb-1';
  } else if (isVerticalText) {
      contentLayoutClass = 'absolute inset-0 flex flex-col items-center justify-center py-8 px-4 gap-2'; 
  } else {
      contentLayoutClass = 'absolute inset-0 flex flex-row items-center justify-center px-8 py-2 gap-2';
  }

  let cornerPosClass = 'top-[3px] left-[3px]';
  if (textRotation === 180) {
      cornerPosClass = 'bottom-[3px] right-[3px] transform rotate-180';
  }

  const THICKNESS_PX = props.isSmall ? 0.5 : 1.5; 
  
  // Engraved Text Effect
  const engravedTextStyle = {
      ...rotationStyle,
      textShadow: props.isInverted 
        ? '0 1px 1px rgba(0,0,0,1)' 
        : '0 1px 0 rgba(255,255,255,0.7), inset 0 1px 2px rgba(0,0,0,0.2)',
      mixBlendMode: props.isInverted ? 'normal' : 'multiply'
  };

  const CardFaceContent = () => (
      <div className="w-full h-full rounded-[inherit] overflow-hidden relative">
          
          {lanternGlow && (
              <div 
                  className="absolute inset-0 z-[5] pointer-events-none rounded-[inherit] animate-pulse-slow-opacity"
                  style={{
                      boxShadow: lanternGlow.secondaryColor 
                          ? `inset 0 0 30px ${lanternGlow.secondaryColor}, inset 0 0 10px ${lanternGlow.color}`
                          : `inset 0 0 35px ${lanternGlow.color}`,
                      mixBlendMode: 'screen'
                  }}
              />
          )}

          {!props.isFaceDown && (
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none mix-blend-multiply"></div>
          )}

          {props.isFaceDown ? (
              <div className="absolute inset-0 z-10">
                  <skin.card.BackComponent isSmall={props.isSmall} />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-40 pointer-events-none mix-blend-overlay"></div>
                  <div className="absolute inset-0 border border-white/5 rounded-[inherit] pointer-events-none"></div>
              </div>
          ) : (
              <>
                  {/* Physical Border Simulation */}
                  <div className={`absolute inset-0 border-[1px] ${props.isInverted ? 'border-[#5c4025]/50' : 'border-black/20'} rounded-[inherit] pointer-events-none z-50`}></div>
                  <div className={`absolute inset-[2px] border ${props.isInverted ? 'border-white/5' : 'border-black/5'} rounded-[inherit] pointer-events-none`}></div>

                  {/* Main Text */}
                  <div className={`z-10 ${contentLayoutClass}`}>
                      <div className={`${mainColorClass} ${mainFontSize} font-calligraphy select-none whitespace-nowrap ${isVerticalText ? 'tategaki' : ''} transition-all`} 
                          style={engravedTextStyle as any}>
                          {card.name}
                      </div>
                  </div>

                  {/* Corner Index */}
                  <div className={`absolute ${cornerPosClass} z-30 flex flex-col items-center justify-center pointer-events-none origin-center`}>
                      <div className={`bg-[#e8e4d9] rounded-[2px] ${indexPadding} border border-black/10 shadow-sm flex ${indexFlexClass} min-w-[18px]`}>
                          <span className={`block ${indexFontSize} ${pokerColorClass} leading-none tracking-tighter text-center`}>{getPokerDisplay(card.value)}</span>
                          <span className={`block ${suitFontSize} ${pokerColorClass} leading-none text-center ${isVerticalText ? 'mt-[-1px]' : ''} opacity-80`}>{getModernSuit(card.suit)}</span>
                      </div>
                  </div>

                  {/* Badges */}
                  {props.isBanker && (
                      <div className="absolute top-1 right-1 z-30" style={rotationStyle}>
                          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-b from-[#b91c1c] to-[#7f1d1d] border border-[#f59e0b] flex items-center justify-center shadow-md">
                              <span className="text-[8px] text-[#fff] font-serif font-bold drop-shadow-md">庄</span>
                          </div>
                      </div>
                  )}
                  {(props.isBaiLao || props.isSuspectedBaiLao) && (
                      <div className="absolute bottom-1 left-1 z-30" style={rotationStyle}>
                          <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full ${props.isSuspectedBaiLao ? 'bg-amber-600' : 'bg-amber-500'} border border-[#3e2b22] flex items-center justify-center shadow-md`}>
                              <span className="text-[8px] text-[#2b180d] font-bold">百</span>
                          </div>
                      </div>
                  )}

                  {/* Dots */}
                  {props.isHand && props.suitStatus && (
                      <div className="absolute bottom-1.5 right-1.5 z-30 pointer-events-none flex flex-col gap-1">
                          {props.suitStatus === 'FORBIDDEN' && (
                              <div className="w-2 h-2 rounded-full bg-red-600 border border-white/30 shadow-[0_0_6px_rgba(220,38,38,0.8)] animate-pulse" title="Forbidden"></div>
                          )}
                          {props.suitStatus === 'SAFE' && (
                              <div className="w-2 h-2 rounded-full bg-emerald-500 border border-white/30 shadow-[0_0_6px_rgba(16,185,129,0.6)]" title="Safe"></div>
                          )}
                      </div>
                  )}

                  <skin.card.EffectOverlay effect={props.leadingEffect || (props.isWinner ? 'GOLD' : null)} />
                  {props.isSelected && (
                      <div className="absolute inset-0 border-2 border-[#C5A059] shadow-[inset_0_0_15px_rgba(197,160,89,0.5)] rounded-[inherit] z-50 mix-blend-screen animate-pulse"></div>
                  )}
              </>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 opacity-30 pointer-events-none mix-blend-overlay rounded-[inherit] z-40"></div>
      </div>
  );

  return (
    <div id={domId} 
         className={`${containerClass} relative ${props.className || ''}`} 
         style={{ transformStyle: 'preserve-3d', ...style }} 
         onClick={props.isDisabled ? undefined : onClick} 
         onTouchStart={props.isDisabled ? undefined : onTouchStart}
    >
      <div className="absolute inset-0 backface-hidden z-20 rounded-[inherit]" 
           style={{ transform: `translateZ(${THICKNESS_PX}px)`, boxShadow: `0 0 1px rgba(0,0,0,0.8)` }}>
          <CardFaceContent />
      </div>

      <div className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
           style={{ background: '#dcdcdc', transform: 'translateZ(0px)', boxShadow: props.isSmall ? `0.5px 0.5px 0 #bbb` : `1px 1px 0 #999` }}>
      </div>
      
      <div className="absolute inset-0 backface-hidden z-20 rounded-[inherit]" 
           style={{ transform: `rotateY(180deg) translateZ(${THICKNESS_PX}px)`, boxShadow: `0 0 1px rgba(0,0,0,0.8)` }}>
          <div className="w-full h-full rounded-[inherit] overflow-hidden relative bg-[#1a100c] p-[2px]">
              <skin.card.BackComponent isSmall={props.isSmall} />
              <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
          </div>
      </div>
    </div>
  );
};

export default React.memo(CardBase);
