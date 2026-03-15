import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { createPortal } from "react-dom";
import { getTranslations } from "next-intl/server";
type MiniWarningPipProps = {
  isTurtle: boolean;
  pipWindow: Window | null;
};
export async function MiniWarningPip({ isTurtle, pipWindow }: MiniWarningPipProps) {
  if (!pipWindow) return null;
  const t = await getTranslations("MiniWarningPip");
  return createPortal(
    <div
      className={`flex h-screen w-screen flex-col items-center justify-center transition-colors duration-500 ${
        isTurtle ? "bg-red-500 text-white" : "bg-[var(--background)] text-[var(--green)]"
      }`}
    >
      {isTurtle ? (
        <>
          <AlertTriangle size={32} className="animate-bounce mt-1.5" />
          <h2 className="font-bold mb-2">🚨 {t("warning")}</h2>
        </>
      ) : (
        <>
          <CheckCircle2 size={32} className="animate-bounce mt-1.5" />
          <h2 className="font-bold mb-2">{t("good")} 🐢</h2>
        </>
      )}
    </div>,
    pipWindow.document.body, // destination of portal
  );
}
