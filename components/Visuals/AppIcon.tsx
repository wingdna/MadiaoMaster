
import React from 'react';

interface AppIconProps {
    className?: string;
    size?: number;
    id?: string; // Added ID prop for export targeting
}

export const AppIcon: React.FC<AppIconProps> = ({ className = "", size = 200, id }) => {
    return (
        <div id={id} className={`relative overflow-hidden rounded-[22%] shadow-2xl ${className}`} style={{ width: size, height: size }}>
            <svg 
                viewBox="0 0 512 512" 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-full h-full"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    {/* 1. Ancient Rubbing Text Filter (Simulates Stone Inscription/Heavy Ink) */}
                    <filter id="ancientRubbing">
                        <feMorphology operator="dilate" radius="1.5" in="SourceAlpha" result="thick" />
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
                        <feComposite operator="in" in="noise" in2="thick" result="texturedText" />
                        <feComposite operator="in" in="SourceGraphic" in2="thick" />
                        <feGaussianBlur stdDeviation="0.3" />
                    </filter>

                    {/* 2. Leaf Vein Texture - Deep & Worn */}
                    <filter id="crispVeins">
                        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="5" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
                        <feComposite operator="in" in2="SourceGraphic" />
                    </filter>

                    {/* 3. Moonlight Glow (Cold) */}
                    <filter id="moonGlow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>

                    {/* 4. Background Grain */}
                    <filter id="nightGrain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
                        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0" />
                        <feComposite operator="in" in2="SourceGraphic" />
                    </filter>

                    {/* --- GRADIENTS --- */}
                    
                    {/* Background: Midnight Deep Blue/Black */}
                    <radialGradient id="nightGrad" cx="50%" cy="30%" r="90%" fx="50%" fy="30%">
                        <stop offset="0%" stopColor="#1a1e24" /> {/* Dark Slate Blue Hint */}
                        <stop offset="60%" stopColor="#08090c" /> {/* Midnight */}
                        <stop offset="100%" stopColor="#000000" /> {/* Void */}
                    </radialGradient>

                    {/* 1. LEFT: "Ma" (Green) - Ancient Moss */}
                    <linearGradient id="leafGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3d5c3d" /> {/* Muted Green */}
                        <stop offset="60%" stopColor="#223822" /> 
                        <stop offset="100%" stopColor="#0f1a0f" /> {/* Shadow */}
                    </linearGradient>

                    {/* 2. MIDDLE: "Diao" (Mixed/Yellow) - Aged Gold Leaf */}
                    <linearGradient id="leafMixed" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#9c8c74" /> {/* Antique Brass */}
                        <stop offset="50%" stopColor="#807050" /> {/* Dark Ochre */}
                        <stop offset="100%" stopColor="#4a4030" /> {/* Shadow */}
                    </linearGradient>

                    {/* 3. RIGHT: "Pai" (Red) - Cinnabar Lacquer */}
                    <linearGradient id="leafRed" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8a3324" /> {/* Rust */}
                        <stop offset="50%" stopColor="#5e2121" /> {/* Deep Red */}
                        <stop offset="100%" stopColor="#2e0f0f" /> {/* Shadow */}
                    </linearGradient>

                    {/* Vein Highlight */}
                    <linearGradient id="veinLight" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="#b0c4de" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>

                {/* --- BACKGROUND --- */}
                <rect width="512" height="512" fill="url(#nightGrad)" />
                <rect width="512" height="512" fill="white" filter="url(#nightGrain)" opacity="0.15" style={{ mixBlendMode: 'overlay' }} />

                {/* --- THE HANGING STRING --- */}
                <path d="M-10,90 C150,120 362,120 522,90" stroke="#5c4025" strokeWidth="2" fill="none" opacity="0.7" filter="url(#moonGlow)" />

                {/* --- LEAF GROUP --- */}
                <g transform="translate(256, 90)">
                    
                    {/* LEAF PATH DEFINITION: Wide Top, Tapered Bottom */}
                    {/* M0,0 (Stem) -> Curve Wide out to +/- 95 -> Taper to 0,360 */}
                    
                    {/* 1. LEFT LEAF: "馬" (Green) */}
                    <g transform="translate(-140, 20) rotate(8)">
                        {/* Leaf Body */}
                        <path 
                            d="M0,0 C -110,60 -90,260 0,360 C 90,260 110,60 0,0 Z" 
                            fill="url(#leafGreen)" 
                            filter="url(#crispVeins)"
                        />
                        {/* Central Vein */}
                        <path d="M0,0 L0,350" stroke="#000" strokeWidth="1" opacity="0.4" />
                        <path d="M0,0 L0,350" stroke="url(#veinLight)" strokeWidth="1" opacity="0.4" />
                        {/* Side Veins */}
                        <g stroke="#aaddaa" strokeWidth="1" opacity="0.1" fill="none">
                            <path d="M0,60 L-60,90 M0,120 L-70,160 M0,180 L-50,230" />
                            <path d="M0,60 L60,90 M0,120 L70,160 M0,180 L50,230" />
                        </g>
                        {/* Character: 馬 */}
                        <text 
                            x="0" y="200" 
                            textAnchor="middle" 
                            fontFamily="'Ma Shan Zheng', serif" 
                            fontSize="130" 
                            fill="#0a1a0a" 
                            stroke="#0a1a0a"
                            strokeWidth="3"
                            opacity="0.9" 
                            filter="url(#ancientRubbing)"
                            style={{ mixBlendMode: 'multiply' }}
                        >
                            馬
                        </text>
                        {/* Stem Connection */}
                        <circle cx="0" cy="5" r="3" fill="#221" />
                    </g>

                    {/* 2. MIDDLE LEAF: "弔" (Mixed) */}
                    <g transform="translate(0, 30) rotate(0)">
                        <path 
                            d="M0,0 C -115,70 -95,280 0,380 C 95,280 115,70 0,0 Z" 
                            fill="url(#leafMixed)" 
                            filter="url(#crispVeins)"
                        />
                        <path d="M0,0 L0,370" stroke="#000" strokeWidth="1" opacity="0.4" />
                        <path d="M0,0 L0,370" stroke="url(#veinLight)" strokeWidth="1" opacity="0.5" />
                        <g stroke="#ffffee" strokeWidth="1" opacity="0.15" fill="none">
                            <path d="M0,70 L-65,100 M0,140 L-75,180 M0,210 L-55,260" />
                            <path d="M0,70 L65,100 M0,140 L75,180 M0,210 L55,260" />
                        </g>
                        {/* Character: 弔 */}
                        <text 
                            x="0" y="210" 
                            textAnchor="middle" 
                            fontFamily="'Ma Shan Zheng', serif" 
                            fontSize="140" 
                            fill="#2e2618" 
                            stroke="#2e2618"
                            strokeWidth="3"
                            opacity="0.95" 
                            filter="url(#ancientRubbing)"
                            style={{ mixBlendMode: 'multiply' }}
                        >
                            弔
                        </text>
                        <circle cx="0" cy="5" r="3" fill="#221" />
                    </g>

                    {/* 3. RIGHT LEAF: "牌" (Red) */}
                    <g transform="translate(140, 20) rotate(-8)">
                        <path 
                            d="M0,0 C -110,60 -90,260 0,360 C 90,260 110,60 0,0 Z" 
                            fill="url(#leafRed)" 
                            filter="url(#crispVeins)"
                        />
                        <path d="M0,0 L0,350" stroke="#000" strokeWidth="1" opacity="0.4" />
                        <path d="M0,0 L0,350" stroke="url(#veinLight)" strokeWidth="1" opacity="0.4" />
                        <g stroke="#ffaaaa" strokeWidth="1" opacity="0.1" fill="none">
                            <path d="M0,60 L-60,90 M0,120 L-70,160 M0,180 L-50,230" />
                            <path d="M0,60 L60,90 M0,120 L70,160 M0,180 L50,230" />
                        </g>
                        {/* Character: 牌 */}
                        <text 
                            x="0" y="200" 
                            textAnchor="middle" 
                            fontFamily="'Ma Shan Zheng', serif" 
                            fontSize="130" 
                            fill="#1f0a0a" 
                            stroke="#1f0a0a"
                            strokeWidth="3"
                            opacity="0.9" 
                            filter="url(#ancientRubbing)"
                            style={{ mixBlendMode: 'multiply' }}
                        >
                            牌
                        </text>
                        <circle cx="0" cy="5" r="3" fill="#221" />
                    </g>

                </g>

                {/* --- ATMOSPHERE --- */}
                
                {/* Night Mist */}
                <rect x="0" y="380" width="512" height="132" fill="url(#nightGrad)" opacity="0.4" filter="url(#moonGlow)" />

                {/* Golden Fireflies */}
                <g fill="#c5a059" style={{ mixBlendMode: 'screen' }} filter="url(#moonGlow)">
                    <circle cx="60" cy="380" r="2" opacity="0.7" />
                    <circle cx="460" cy="420" r="2" opacity="0.6" />
                    <circle cx="120" cy="460" r="1.5" opacity="0.5" />
                    <circle cx="320" cy="400" r="1.5" opacity="0.4" />
                    <circle cx="256" cy="40" r="1.5" opacity="0.5" />
                </g>

                {/* Heavy Vignette for "Yugen" (Mystery) */}
                <radialGradient id="heavyVignette" cx="50%" cy="50%" r="55%">
                    <stop offset="70%" stopColor="transparent" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.9" />
                </radialGradient>
                <rect width="512" height="512" fill="url(#heavyVignette)" style={{ mixBlendMode: 'multiply' }} />

            </svg>
        </div>
    );
};
