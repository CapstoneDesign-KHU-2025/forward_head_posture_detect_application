import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AppState = {
  turtleNeckNumberInADay: number;
  setTurtleNeckNumberInADay: (v: number | ((prev: number) => number)) => void;
  resetTurtleNeckNumberInADay: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      turtleNeckNumberInADay: 0,
      setTurtleNeckNumberInADay: (v) =>
        set((s) => ({ turtleNeckNumberInADay: typeof v === "function" ? (v as any)(s.turtleNeckNumberInADay) : v })),
      resetTurtleNeckNumberInADay: () => set({ turtleNeckNumberInADay: 0 }),
    }),
    {
      name: "app-store", // sessionStorage 키
      storage: createJSONStorage(() => sessionStorage), // ← 세션 지속
    }
  )
);
