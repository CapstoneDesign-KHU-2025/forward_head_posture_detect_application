"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { usePiPStore } from "@/app/store/usePipStore";
import { logger } from "@/lib/logger";

declare global {
  interface DocumentPictureInPicture {
    requestWindow(options?: {
      width?: number;
      height?: number;
    }): Promise<Window>;
    window: Window | null;
  }
  interface Window {
    readonly documentPictureInPicture: DocumentPictureInPicture;
  }
}

function copyDocumentStylesToPictureInPicture(targetDoc: Document) {
  [...document.styleSheets].forEach((styleSheet) => {
    try {
      const cssRules = [...styleSheet.cssRules]
        .map((rule) => rule.cssText)
        .join("");
      const style = document.createElement("style");
      style.textContent = cssRules;
      targetDoc.head.appendChild(style);
    } catch {
      if (styleSheet.href) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = styleSheet.href;
        targetDoc.head.appendChild(link);
      }
    }
  });
}

function subscribePipWindowPagehide(pip: Window, onClose: () => void) {
  pip.addEventListener("pagehide", onClose);
}

type PiPContextType = {
  openPiP: () => Promise<void>;
  closePiP: () => void;
};

const PiPContext = createContext<PiPContextType | null>(null);

export function PiPController({ children }: { children: ReactNode }) {
  const pipWindow = usePiPStore((state) => state.pipWindow);
  const setPipWindow = usePiPStore((state) => state.setPipWindow);

  const openPiP = useCallback(async () => {
    if (pipWindow) return;
    if (!("documentPictureInPicture" in window)) return;

    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width: 100,
        height: 80,
      });

      copyDocumentStylesToPictureInPicture(pip.document);
      subscribePipWindowPagehide(pip, () => setPipWindow(null));
      setPipWindow(pip);
    } catch (error) {
      logger.error("[PiPController] requestWindow failed:", error);
    }
  }, [pipWindow, setPipWindow]);

  const closePiP = useCallback(() => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    } else if (window.documentPictureInPicture?.window) {
      window.documentPictureInPicture.window.close();
    }
  }, [pipWindow, setPipWindow]);

  useEffect(() => {
    return () => {
      if (pipWindow) pipWindow.close();
    };
  }, [pipWindow]);

  return (
    <PiPContext.Provider value={{ openPiP, closePiP }}>
      {children}
    </PiPContext.Provider>
  );
}

export function useDocumentPiP() {
  const context = useContext(PiPContext);
  if (!context) {
    throw new Error(
      "[PipController] : useDocumentPiP must be used within a PiPController",
    );
  }
  return context;
}
