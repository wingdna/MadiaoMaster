
import { useRef, useEffect, useCallback } from 'react';

// Audio System Hook
// Responsibilities: Manage AudioContext, Decode PCM, Play Buffers
export const useAudioSystem = (isMuted: boolean) => {
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
            audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
        }
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
        const dataInt16 = new Int16Array(data.buffer);
        const frameCount = dataInt16.length / numChannels;
        const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < frameCount; i++) {
                channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
            }
        }
        return buffer;
    };

    const playPcmAudio = useCallback(async (pcmData: Uint8Array) => {
        if (isMuted || !audioContextRef.current) return;
        
        try {
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }
            const audioBuffer = await decodeAudioData(pcmData, audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start();
        } catch (e) {
            console.error("Audio playback error", e);
        }
    }, [isMuted]);

    return {
        playPcmAudio
    };
};
