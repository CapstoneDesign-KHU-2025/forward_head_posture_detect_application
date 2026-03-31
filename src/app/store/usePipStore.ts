import { create } from "zustand";

interface PiPState {
  pipWindow: Window | null;
  setPipWindow: (window: Window | null) => void;
}

export const usePiPStore = create<PiPState>((set) => ({
  pipWindow: null,
  setPipWindow: (window) => set({ pipWindow: window }),
}));
