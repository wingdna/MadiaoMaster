
import React, { useState, useEffect } from 'react';
import { UserProfile, SocialProvider, Gender } from '../../types';
import { platformService } from '../../services/platformService';
import { upsertUserProfile, findMatch, addFriend, getFriends } from '../../services/cloudService';

interface SocialLoginModalProps {
    onClose: () => void;
    onLoginSuccess: (profile: UserProfile) => void;
}

export const SocialLoginModal: React.FC<SocialLoginModalProps> = ({ onClose, onLoginSuccess }) => {
    const [step, setStep] = useState<'LOGIN' | 'QR_SCAN' | 'PROFILE' | 'MATCHING'>('LOGIN');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // QR State (Only relevant for Web Adapter simulating Mobile)
    const [activeProvider, setActiveProvider] = useState<SocialProvider | null>(null);
    const [qrStatus, setQrStatus] = useState<'GENERATING' | 'WAITING' | 'SCANNED' | 'SUCCESS'>('GENERATING');
    
    // Profile State
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState<Gender>('OTHER');
    const [age, setAge] = useState<number>(25);
    const [country, setCountry] = useState<string>('cn');
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [matches, setMatches] = useState<UserProfile[]>([]);
    const [friends, setFriends] = useState<UserProfile[]>([]);

    const supportedProviders = platformService.auth.getSupportedProviders();

    const handleLogin = async (provider: SocialProvider) => {
        setError('');
        setLoading(true);

        // SPECIAL CASE: Web Adapter Mocks for Douyin/WeChat still use the QR flow visual
        // In a REAL Native/MiniGame adapter, platformService.auth.login() would trigger system UI immediately.
        if (platformService.id === 'WEB' && (provider === SocialProvider.WECHAT || provider === SocialProvider.DOUYIN)) {
             setActiveProvider(provider);
             setStep('QR_SCAN');
             setQrStatus('GENERATING');
             setTimeout(() => setQrStatus('WAITING'), 800);
             setTimeout(() => setQrStatus('SCANNED'), 3500);
             setTimeout(async () => {
                 setQrStatus('SUCCESS');
                 const result = await platformService.auth.login(provider);
                 handleAuthResult(result);
             }, 5500);
             return;
        }

        // Standard Flow
        const result = await platformService.auth.login(provider);
        handleAuthResult(result);
        setLoading(false);
    };

    const handleAuthResult = async (result: any) => {
        if (!result.success) {
            setError(result.error || "Login Failed");
            return;
        }
        
        if (result.user) {
            // Check if profile needs completion
            if (result.user.username && result.user.age) {
                // Profile exists
                setUsername(result.user.username);
                setAvatarPreview(result.user.avatar_url || '');
                setStep('MATCHING');
                const f = await getFriends();
                setFriends(f);
                const candidates = await findMatch(result.user);
                setMatches(candidates);
            } else {
                setStep('PROFILE');
                setUsername(result.user.username || 'Player');
            }
        } else {
            setStep('PROFILE');
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        const updates: Partial<UserProfile> = {
            username, gender, age, country, 
            avatar_url: avatarPreview,
            is_looking_for_match: true
        };
        const saved = await upsertUserProfile(updates);
        if (saved) {
            setStep('MATCHING');
            const candidates = await findMatch(saved as UserProfile);
            setMatches(candidates);
        }
        setLoading(false);
    };

    // --- RENDERERS ---

    const renderQR = () => (
        <div className="flex flex-col items-center justify-center py-6 animate-fade-in">
             <div className="text-[#c5a059] mb-4">Scan with {activeProvider}</div>
             <div className={`w-48 h-48 bg-white p-2 ${qrStatus==='SUCCESS'?'border-4 border-[#c5a059]':''}`}>
                 {qrStatus === 'GENERATING' ? 'Generating...' : 
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=login_${activeProvider}`} className="w-full h-full"/>}
             </div>
             <div className="mt-4 text-[#a0a0a0] text-xs">{qrStatus === 'WAITING' ? 'Waiting for scan...' : qrStatus}</div>
             {qrStatus === 'SUCCESS' && <div className="text-green-500 font-bold mt-2">Success! Redirecting...</div>}
        </div>
    );

    const renderLoginButtons = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full px-8">
            {supportedProviders.map(p => (
                <button key={p} onClick={() => handleLogin(p)} className="flex items-center justify-center gap-2 py-4 border border-[#3e2b22] hover:border-[#c5a059] hover:bg-[#1a1a1a] transition-all bg-[#0a0806]">
                    <span className="text-[#c5a059] uppercase text-xs tracking-widest">{p} Login</span>
                </button>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in font-serif">
             <div className="bg-[#15100e] border border-[#3e2b22] w-full max-w-lg p-8 rounded-sm shadow-lacquer-deep relative overflow-hidden flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-[#5c4025] hover:text-[#c5a059] z-20">✕</button>

                {step === 'LOGIN' && (
                    <div className="flex flex-col items-center gap-8 py-8">
                        <h2 className="text-2xl text-[#c5a059] font-bold tracking-[0.2em] uppercase text-center">Login via {platformService.id}</h2>
                        {renderLoginButtons()}
                        {error && <div className="text-red-500 text-xs mt-4">{error}</div>}
                        {loading && <div className="text-[#c5a059] text-xs animate-pulse">Processing...</div>}
                    </div>
                )}

                {step === 'QR_SCAN' && renderQR()}

                {step === 'PROFILE' && (
                    <div className="flex flex-col gap-4 py-4 overflow-y-auto">
                        <h2 className="text-xl text-[#c5a059] text-center">Create Persona</h2>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="bg-[#0a0806] border border-[#3e2b22] px-3 py-2 text-[#e6c278]"/>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" value={age} onChange={e => setAge(parseInt(e.target.value))} className="bg-[#0a0806] border border-[#3e2b22] px-3 py-2 text-[#e6c278]"/>
                            <select value={gender} onChange={e => setGender(e.target.value as Gender)} className="bg-[#0a0806] border border-[#3e2b22] px-3 py-2 text-[#e6c278]">
                                <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
                            </select>
                        </div>
                        <button onClick={handleSaveProfile} className="mt-4 py-3 bg-[#3d0e0e] text-[#a0a0a0] border border-[#5c1010] hover:text-white">Enter World</button>
                    </div>
                )}

                {step === 'MATCHING' && (
                    <div className="flex flex-col gap-4 h-full">
                        <h2 className="text-xl text-[#c5a059] text-center border-b border-[#3e2b22] pb-2">Lobby</h2>
                        <div className="flex-1 overflow-y-auto space-y-2">
                             {matches.map(m => (
                                 <div key={m.id} className="p-2 border border-[#3e2b22] flex justify-between items-center text-xs text-[#a0a0a0]">
                                     <span>{m.username}</span>
                                     <button onClick={() => addFriend(m.id)} className="text-[#c5a059] hover:underline">+ Friend</button>
                                 </div>
                             ))}
                        </div>
                        <button onClick={() => { onClose(); onLoginSuccess({ id: 'me', username, gender, age, country } as UserProfile); }} className="w-full py-3 bg-[#1a1a1a] border border-[#c5a059] text-[#c5a059]">START GAME</button>
                    </div>
                )}
             </div>
        </div>
    );
};
