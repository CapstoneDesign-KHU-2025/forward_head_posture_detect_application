"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

declare global {
  interface DocumentPictureInPicture {
    requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
    window: Window | null;
  }
  interface Window {
    readonly documentPictureInPicture: DocumentPictureInPicture;
  }
}

interface PiPContextType {
  pipWindow: Window | null;
  openPiP: () => Promise<void>;
  closePiP: () => void;
}

const PiPContext = createContext<PiPContextType | null>(null);

export function PiPProvider({ children }: { children: ReactNode }) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  const openPiP = useCallback(async () => {
    if (pipWindow) return;
    if (!("documentPictureInPicture" in window)) return;

    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width: 100,
        height: 80,
      });

      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join("");
          const style = document.createElement("style");
          style.textContent = cssRules;
          pip.document.head.appendChild(style);
        } catch (e) {
          if (styleSheet.href) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = styleSheet.href;
            pip.document.head.appendChild(link);
          }
        }
      });

      pip.addEventListener("pagehide", () => setPipWindow(null));
      setPipWindow(pip);
    } catch (error) {
      console.error("clientSide Error: Popup", error);
    }
  }, [pipWindow]);

  const closePiP = useCallback(() => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    } else if (window.documentPictureInPicture?.window) {
      window.documentPictureInPicture.window.close();
    }
  }, [pipWindow]);

  useEffect(() => {
    return () => {
      if (pipWindow) pipWindow.close();
    };
  }, [pipWindow]);

  return <PiPContext.Provider value={{ pipWindow, openPiP, closePiP }}>{children}</PiPContext.Provider>;
}

export function useDocumentPiP() {
  const context = useContext(PiPContext);
  if (!context) {
    throw new Error("useDocumentPiP must be used within a PiPProvider");
  }
  return context;
}
