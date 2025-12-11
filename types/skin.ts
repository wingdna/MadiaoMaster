
import React from 'react';
import { Card, Suit, CardRank, SuitStatus, LeadingEffectType } from '../types';

export interface CardStyleProps {
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
    suitStatus?: SuitStatus;
    isForbidden?: boolean;
    isDisabled?: boolean;
    isDraggable?: boolean;
    isSuggested?: boolean;
    isWinner?: boolean;
    leadingEffect?: LeadingEffectType;
}

export interface CharacterAssets {
    // Determine which view to show based on table position
    // Updated to accept quality prop for optimization
    bodyFront: React.FC<{ colorTheme?: string; quality?: 'HIGH' | 'LOW' }>; 
    bodySideLeft: React.FC<{ colorTheme?: string; quality?: 'HIGH' | 'LOW' }>; 
    bodySideRight: React.FC<{ colorTheme?: string; quality?: 'HIGH' | 'LOW' }>; 
    headOutline: string; 
    chairComponent: React.FC<{ position?: string; quality?: 'HIGH' | 'LOW' }>; 
}

export interface ISkin {
    id: string;
    name: string;
    description: string;

    // 1. Scene & Atmosphere
    layout: {
        backgroundClass: string; 
        atmosphereComponent: React.FC<{ quality?: 'HIGH' | 'LOW' }>; 
        tableSurfaceClass: string; 
        tableSurfaceStyle?: React.CSSProperties; 
        tableBorderClass: string;
    };

    // 2. Card Visuals
    card: {
        getContainerClass: (props: CardStyleProps) => string;
        getMainColorClass: (color: string, isInverted?: boolean) => string;
        getPokerColorClass: (suit: Suit, isInverted?: boolean) => string;
        getBorderClass: (props: CardStyleProps) => string;
        getShadowClass: (props: CardStyleProps) => string;
        BackComponent: React.FC<{ isSmall?: boolean }>;
        EffectOverlay: React.FC<{ effect: LeadingEffectType }>;
    };

    // 3. HUD & UI Elements
    hud: {
        avatarContainerClass: (isMyTurn: boolean) => string;
        buttonClass: (disabled: boolean) => string;
        modalOverlayClass: string;
        modalContentClass: string;
    };
    
    // 4. Effects
    lighting: {
        StoveLighting: React.FC<{ activePlayerId: number }>;
        TableBorderFlow: React.FC<{ activePlayerId: number, isVertical?: boolean }>; 
    };

    // 5. Characters
    character: CharacterAssets;
}
