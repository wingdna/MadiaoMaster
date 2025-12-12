
import React, { useMemo } from 'react';

interface AppIconProps {
    className?: string;
    size?: number;
    id?: string; // Added ID prop for export targeting
}

export const AppIcon: React.FC<AppIconProps> = ({ className = "", size = 200, id }) => {
    // Generate a unique ID suffix for this instance to prevent filter collision
    const uid = useMemo(() => Math.random().toString(36).substr(2, 9), []);
    
    return (
        <div id={id} className={`relative overflow-hidden rounded-[22%] shadow-2xl ${className}`} style={{ width: size, height: size }}>
            <svg 
                viewBox="0 0 512 512" 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-full h-full"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    {/* 1. Ancient Rubbing Text Filter */}
                    <filter id={`ancientRubbing-${uid}`}>
                        <feMorphology operator="dilate" radius="1.5" in="SourceAlpha" result="thick" />
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
                        <feComposite operator="in" in="noise" in2="thick" result="texturedText" />
                        <feComposite operator="in" in="SourceGraphic" in2="thick" />
                        <feGaussianBlur stdDeviation="0.3" />
                    </filter>

                    {/* 2. Leaf Vein Texture */}
                    <filter id={`crispVeins-${uid}`}>
                        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="5" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
                        <feComposite operator="in" in2="SourceGraphic" />
                    </filter>

                    {/* 3. Moonlight Glow */}
                    <filter id={`moonGlow-${uid}`}>
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>

                    {/* 4. Background Grain */}
                    <filter id={`nightGrain-${uid}`}>
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
                        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0" />
                        <feComposite operator="in" in2="SourceGraphic" />
                    </filter>

                    {/* --- GRADIENTS --- */}
                    <radialGradient id={`nightGrad-${uid}`} cx="50%" cy="30%" r="90%" fx="50%" fy="30%">
                        <stop offset="0%" stopColor="#1a1e24" />
                        <stop offset="60%" stopColor="#08090c" />
                        <stop offset="100%" stopColor="#000000" />
                    </radialGradient>

                    <linearGradient id={`leafGreen-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3d5c3d" />
                        <stop offset="60%" stopColor="#223822" />
                        <stop offset="100%" stopColor="#0f1a0f" />
                    </linearGradient>

                    <linearGradient id={`leafMixed-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#9c8c74" />
                        <stop offset="50%" stopColor="#807050" />
                        <stop offset="100%" stopColor="#4a4030" />
                    </linearGradient>

                    <linearGradient id={`leafRed-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8a3324" />
                        <stop offset="50%" stopColor="#5e2121" />
                        <stop offset="100%" stopColor="#2e0f0f" />
                    </linearGradient>

                    <linearGradient id={`veinLight-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="#b0c4de" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                    
                    <radialGradient id={`heavyVignette-${uid}`} cx="50%" cy="50%" r="55%">
                        <stop offset="70%" stopColor="transparent" />
                        <stop offset="100%" stopColor="#000" stopOpacity="0.9" />
                    </radialGradient>
                </defs>

                {/* --- BACKGROUND --- */}
                <rect width="512" height="512" fill={`url(#nightGrad-${uid})`} />
                <rect width="512" height="512" fill="white" filter={`url(#nightGrain-${uid})`} opacity="0.15" style={{ mixBlendMode: 'overlay' }} />

                {/* --- THE HANGING STRING --- */}
                <path d="M-10,90 C150,120 362,120 522,90" stroke="#5c4025" strokeWidth="2" fill="none" opacity="0.7" filter={`url(#moonGlow-${uid})`} />

                {/* --- LEAF GROUP --- */}
                <g transform="translate(256, 90)">
                    
                    {/* 1. LEFT LEAF: "馬" (Green) */}
                    <g transform="translate(-140, 20) rotate(8)">
                        <path 
                            d="M0,0 C -110,60 -90,260 0,360 C 90,260 110,60 0,0 Z" 
                            fill={`url(#leafGreen-${uid})`} 
                            filter={`url(#crispVeins-${uid})`}
                        />
                        <path d="M0,0 L0,350" stroke="#000" strokeWidth="1" opacity="0.4" />
                        <path d="M0,0 L0,350" stroke={`url(#veinLight-${uid})`} strokeWidth="1" opacity="0.4" />
                        <text 
                            x="0" y="200" 
                            textAnchor="middle" 
                            fontFamily="'Ma Shan Zheng', serif" 
                            fontSize="130" 
                            fill="#0a1a0a" 
                            stroke="#0a1a0a"
                            strokeWidth="3"
                            opacity="0.9" 
                            filter={`url(#ancientRubbing-${uid})`}
                            style={{ mixBlendMode: 'multiply' }}
                        >
                            馬
                        </text>
                        <circle cx="0" cy="5" r="3" fill="#221" />
                    </g>

                    {/* 2. MIDDLE LEAF: "弔" (Mixed) */}
                    <g transform="translate(0, 30) rotate(0)">
                        <path 
                            d="M0,0 C -115,70 -95,280 0,380 C 95,280 115,70 0,0 Z" 
                            fill={`url(#leafMixed-${uid})`} 
                            filter={`url(#crispVeins-${uid})`}
                        />
                        <path d="M0,0 L0,370" stroke="#000" strokeWidth="1" opacity="0.4" />
                        <path d="M0,0 L0,370" stroke={`url(#veinLight-${uid})`} strokeWidth="1" opacity="0.5" />
                        <text 
                            x="0" y="210" 
                            textAnchor="middle" 
                            fontFamily="'Ma Shan Zheng', serif" 
                            fontSize="140" 
                            fill="#2e2618" 
                            stroke="#2e2618"
                            strokeWidth="3"
                            opacity="0.95" 
                            filter={`url(#ancientRubbing-${uid})`}
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
                            fill={`url(#leafRed-${uid})`} 
                            filter={`url(#crispVeins-${uid})`}
                        />
                        <path d="M0,0 L0,350" stroke="#000" strokeWidth="1" opacity="0.4" />
                        <path d="M0,0 L0,350" stroke={`url(#veinLight-${uid})`} strokeWidth="1" opacity="0.4" />
                        <text 
                            x="0" y="200" 
                            textAnchor="middle" 
                            fontFamily="'Ma Shan Zheng', serif" 
                            fontSize="130" 
                            fill="#1f0a0a" 
                            stroke="#1f0a0a"
                            strokeWidth="3"
                            opacity="0.9" 
                            filter={`url(#ancientRubbing-${uid})`}
                            style={{ mixBlendMode: 'multiply' }}
                        >
                            牌
                        </text>
                        <circle cx="0" cy="5" r="3" fill="#221" />
                    </g>

                </g>

                {/* --- ATMOSPHERE --- */}
                <rect x="0" y="380" width="512" height="132" fill={`url(#nightGrad-${uid})`} opacity="0.4" filter={`url(#moonGlow-${uid})`} />
                <rect width="512" height="512" fill={`url(#heavyVignette-${uid})`} style={{ mixBlendMode: 'multiply' }} />

            </svg>
        </div>
    );
};
