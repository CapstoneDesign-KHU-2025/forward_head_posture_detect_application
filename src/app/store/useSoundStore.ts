import { create } from "zustand";

interface SoundState {
  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (v: boolean) => void;
}

export const useSoundStore = create<SoundState>((set) => ({
  isMuted: false,
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setMuted: (v) => set({ isMuted: v }),
}));
