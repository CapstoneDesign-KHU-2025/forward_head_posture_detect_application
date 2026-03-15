import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { createPortal } from "react-dom";

type MiniWarningPipProps = {
  isTurtle: boolean;
  pipWindow: Window | null;
};
export function MiniWarningPip({ isTurtle, pipWindow }: MiniWarningPipProps) {
  if (!pipWindow) return null;

  return createPortal(
    <div
      className={`flex h-screen w-screen flex-col items-center justify-center transition-colors duration-500 ${
        isTurtle ? "bg-red-500 text-white" : "bg-[var(--background)] text-[var(--green)]"
      }`}
    >
      {isTurtle ? (
        <>
          <AlertTriangle size={32} className="animate-bounce mt-1.5" />
          <h2 className="font-bold mb-2">🚨 Warning!</h2>
        </>
      ) : (
        <>
          <CheckCircle2 size={32} className="animate-bounce mt-1.5" />
          <h2 className="font-bold mb-2">Good posture 🐢</h2>
        </>
      )}
    </div>,
    pipWindow.document.body, // destination of portal
  );
}
