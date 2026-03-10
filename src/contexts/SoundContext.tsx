"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return <SoundContext.Provider value={{ isMuted, toggleMute }}>{children}</SoundContext.Provider>;
}

export function useSoundContext() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSoundContext는 SoundProvider 안에서만 사용해야 합니다.");
  }
  return context;
}
