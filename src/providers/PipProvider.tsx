"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

declare global {
  interface DocumentPictureInPicture {
    requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
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

// 2. Context 생성
const PiPContext = createContext<PiPContextType | null>(null);

// 3. Provider 컴포넌트 (앱 전체를 감싸서 상태를 공유할 녀석)
export function PiPProvider({ children }: { children: ReactNode }) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  const openPiP = useCallback(async () => {
    if (pipWindow) return; // 이미 열려있으면 방어
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
    }
  }, [pipWindow]);

  useEffect(() => {
    return () => {
      if (pipWindow) pipWindow.close();
    };
  }, [pipWindow]);

  return <PiPContext.Provider value={{ pipWindow, openPiP, closePiP }}>{children}</PiPContext.Provider>;
}

// 4. 컴포넌트들에서 가져다 쓸 커스텀 훅!
export function useDocumentPiP() {
  const context = useContext(PiPContext);
  if (!context) {
    throw new Error("useDocumentPiP must be used within a PiPProvider");
  }
  return context;
}
