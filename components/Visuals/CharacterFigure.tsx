
import React, { useMemo } from 'react';
import { Player } from '../../types';
import { useSkin } from '../../contexts/SkinContext';

interface CharacterFigureProps {
    player: Player;
    position: 'Top' | 'Left' | 'Right'; 
    isActive: boolean;
    isBanker: boolean;
    isBaiLao: boolean;
    statusText: string;
    quality?: 'HIGH' | 'LOW';
}

export const CharacterFigure: React.FC<CharacterFigureProps> = React.memo(({ player, position, isActive, isBanker, isBaiLao, statusText, quality = 'HIGH' }) => {
    const { skin } = useSkin();
    const profile = player.profile;
    const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/9.x/miniavs/svg?seed=${player.name}&backgroundColor=transparent`;

    let BodyComponent = skin.character.bodyFront;
    if (position === 'Left') BodyComponent = skin.character.bodySideLeft; 
    if (position === 'Right') BodyComponent = skin.character.bodySideRight;

    // ... (Keep visual logic simple for stability) ...
    const transformStyle = useMemo(() => {
        let base = 'scale(1.0)';
        if (isActive) base = 'scale(1.08) translateY(-5px)';
        return base;
    }, [isActive]);

    return (
        <div className={`relative w-40 h-40 md:w-96 md:h-96 flex items-end justify-center pointer-events-none transition-all duration-700 ease-out select-none ${isActive ? 'z-50 filter brightness-110' : 'opacity-95'}`} 
            style={{ transformStyle: 'preserve-3d', transformOrigin: 'bottom center', transform: transformStyle }}>
            
            {/* Simple Layer Structure to avoid depth issues */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-end">
                {/* Head */}
                <div className="w-16 h-16 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-[#3e2b22] bg-[#dcd0b8] relative z-20 shadow-xl mb-[-10%]">
                    <img src={avatarUrl} className="w-full h-full object-cover sepia-[0.3]" alt="" />
                </div>
                
                {/* Body */}
                <div className="w-full h-3/4 relative z-10">
                    <BodyComponent quality={quality} />
                </div>
            </div>

            {/* Badges */}
            <div className="absolute top-0 right-0 z-30 flex flex-col gap-1" style={{ transform: 'translateZ(50px)' }}>
                {isBanker && <div className="bg-red-800 text-gold px-2 py-1 rounded border border-gold text-xs shadow-md">庄</div>}
                {isBaiLao && <div className="bg-yellow-600 text-black px-2 py-1 rounded border border-yellow-300 text-xs shadow-md">百</div>}
            </div>
        </div>
    );
});
