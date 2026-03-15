"use client";
import { useState, useCallback } from "react";

export function useDocumentPiP() {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  const openPiP = useCallback(async () => {
    if (!("documentPictureInPicture" in window)) {
      //지원하지 않는 브라우저임. 이때는 두번째 방식을 해야됨
      return;
    }

    try {
      const pip = await (window as any).documentPictureInPicture.requestWindow({
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
          //These property is blocked by cors so we send them in this way.
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = styleSheet.href || "";
          pip.document.head.appendChild(link);
        }
      });

      //initialize when user close the popup

      pip.addEventListener("pagehide", () => setPipWindow(null));
      setPipWindow(pip);
    } catch (error) {
      console.error("PiP 창을 여는 중 에러 발생:", error);
    }
  }, []);

  const closePiP = useCallback(() => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    }
  }, [pipWindow]);

  return { pipWindow, openPiP, closePiP };
}
