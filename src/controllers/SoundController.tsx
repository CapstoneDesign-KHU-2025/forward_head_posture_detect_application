"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { useSoundStore } from "@/app/store/useSoundStore";

type SoundContextType = {
  getAudio: () => { ctx: AudioContext; masterGain: GainNode } | null;
};

const SoundContext = createContext<SoundContextType | null>(null);

function applyMuteToMasterGain(masterGain: GainNode, isMuted: boolean) {
  masterGain.gain.value = isMuted ? 0 : 1;
}

function createMasterGainAudioGraph() {
  const ctx = new AudioContext();
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  return {
    ctx,
    masterGain,
    dispose: () => {
      void ctx.close();
    },
  };
}

export function SoundController({ children }: { children: React.ReactNode }) {
  const isMuted = useSoundStore((state) => state.isMuted);
  const audioRef = useRef<{ ctx: AudioContext; masterGain: GainNode } | null>(
    null,
  );

  useEffect(() => {
    const { ctx, masterGain, dispose } = createMasterGainAudioGraph();
    audioRef.current = { ctx, masterGain };
    return () => {
      audioRef.current = null;
      dispose();
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    applyMuteToMasterGain(audio.masterGain, isMuted);
  }, [isMuted]);

  const value = useMemo<SoundContextType>(
    () => ({
      getAudio: () => audioRef.current,
    }),
    [],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSoundContext() {
  const ctx = useContext(SoundContext);
  if (!ctx)
    throw new Error(
      "[SoundController] : useSoundContext should be used only in SoundController",
    );

  return ctx;
}
