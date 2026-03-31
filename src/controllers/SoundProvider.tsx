"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type SoundContextType = {
  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (v: boolean) => void;
  getAudio: () => { ctx: AudioContext; masterGain: GainNode } | null;
};

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setMuted] = useState(false);

  const audioRef = useRef<{ ctx: AudioContext; masterGain: GainNode } | null>(null);

  useEffect(() => {
    const ctx = new AudioContext();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    audioRef.current = { ctx, masterGain };

    return () => {
      audioRef.current = null;
      ctx.close();
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.masterGain.gain.value = isMuted ? 0 : 1;
  }, [isMuted]);

  const value = useMemo<SoundContextType>(
    () => ({
      isMuted,
      toggleMute: () => setMuted((p) => !p),
      setMuted,
      getAudio: () => audioRef.current,
    }),
    [isMuted],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSoundContext() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("[soundProvider] : useSoundContext should be used only in SoundProvider");
  return ctx;
}
