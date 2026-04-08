import { create } from "zustand";

type MeasurementState = {
  stopEstimating: boolean;
  isProcessing: boolean;
  elapsedSeconds: number;
  measurementStarted: boolean;

  setStopEstimating: (val: boolean) => void;
  setIsProcessing: (val: boolean) => void;
  incrementElapsedSeconds: () => void;
  resetElapsedSeconds: () => void;
  startMeasurement: () => void;
  stopMeasurement: () => void;
};

export const useMeasurementStore = create<MeasurementState>((set, get) => ({
  stopEstimating: true,
  isProcessing: false,
  elapsedSeconds: 0,
  measurementStarted: false,

  setStopEstimating: (val) => set({ stopEstimating: val }),
  setIsProcessing: (val) => set({ isProcessing: val }),
  incrementElapsedSeconds: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),
  resetElapsedSeconds: () => set({ elapsedSeconds: 0 }),

  startMeasurement: () => {
    set({ stopEstimating: false, measurementStarted: true });
  },

  stopMeasurement: () => {
    set({ stopEstimating: true, isProcessing: false });
  },
}));
