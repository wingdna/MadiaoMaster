
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ISkin } from '../types/skin';
import { ImperialSkin } from '../skins/imperialSkin';
import { ChristmasSkin } from '../skins/christmasSkin';
import { MingSkin } from '../skins/mingSkin';
import { TaoistSkin } from '../skins/taoistSkin';

interface SkinContextType {
    skin: ISkin;
    setSkinId: (id: string) => void;
    availableSkins: ISkin[];
}

const defaultContext: SkinContextType = {
    skin: ImperialSkin,
    setSkinId: () => {},
    availableSkins: [ImperialSkin, ChristmasSkin, MingSkin, TaoistSkin]
};

const SkinContext = createContext<SkinContextType>(defaultContext);

export const SkinProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Registry of available skins
    const availableSkins = [ImperialSkin, ChristmasSkin, MingSkin, TaoistSkin];
    
    // State
    const [currentSkin, setCurrentSkin] = useState<ISkin>(ImperialSkin);

    const setSkinId = (id: string) => {
        const found = availableSkins.find(s => s.id === id);
        if (found) {
            setCurrentSkin(found);
            try {
                localStorage.setItem('ma_diao_skin_id', id);
            } catch (e) {
                console.warn("Could not save skin preference", e);
            }
        }
    };

    // Load from local storage on mount
    React.useEffect(() => {
        try {
            const savedId = localStorage.getItem('ma_diao_skin_id');
            if (savedId && savedId !== currentSkin.id) {
                const found = availableSkins.find(s => s.id === savedId);
                if (found) setCurrentSkin(found);
            }
        } catch (e) {
            console.warn("Could not load skin preference", e);
        }
    }, []);

    return (
        <SkinContext.Provider value={{ skin: currentSkin, setSkinId, availableSkins }}>
            {children}
        </SkinContext.Provider>
    );
};

export const useSkin = () => useContext(SkinContext);
