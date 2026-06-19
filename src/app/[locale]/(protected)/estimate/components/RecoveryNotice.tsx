"use client";

import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { tv } from "tailwind-variants";

const styles = tv({
  slots: {
    container: [
      "fixed bottom-8 left-1/2 z-[200] -translate-x-1/2",
      "flex items-center gap-4 rounded-[20px] bg-[var(--green-dark-background)] backdrop-blur-sm px-6 py-5",
      "shadow-[0_8px_32px_rgba(0,0,0,0.25)] w-[min(480px,calc(100vw-32px))]",
      "transition-all duration-300 ease-out",
    ],
    content: "flex items-center gap-4 min-w-0 flex-1",
    textGroup: "flex flex-col gap-0.5",
    actions: "flex items-center gap-2 shrink-0",
    dismissBtn:
      "rounded-[10px] border border-white/30 bg-white/10 px-4 py-2 text-[13px] font-medium text-white/90 transition-colors hover:bg-white/20",
    restartBtn:
      "rounded-[10px] bg-[var(--green)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--green-mid)]",
  },
  variants: {
    visible: {
      true: { container: "translate-y-0 opacity-100" },
      false: { container: "translate-y-5 opacity-0 pointer-events-none" },
    },
  },
});

type RecoveryNoticeProps = {
  isVisible: boolean;
  onRestart: () => void;
  onDismiss: () => void;
  className?: string;
};

export function RecoveryNotice({ isVisible, onRestart, onDismiss, className }: RecoveryNoticeProps) {
  const t = useTranslations("RecoveryNotice");
  const { container, content, textGroup, actions, dismissBtn, restartBtn } = styles({ visible: isVisible });

  return (
    <div role="alert" aria-live="polite" className={cn(container(), className)}>
      <div className={content()}>
        <span className="text-[28px] shrink-0" aria-hidden>
          🐢
        </span>
        <div className={textGroup()}>
          <p className="text-[16px] font-bold text-white">{t("message")}</p>
          <p className="text-[14px] font-semibold text-white/70">{t("restart")}</p>
        </div>
      </div>
      <div className={actions()}>
        <Button type="button" variant="ghost" onClick={onDismiss} className={dismissBtn()}>
          {t("button.no")}
        </Button>
        <Button type="button" variant="ghost" onClick={onRestart} className={restartBtn()}>
          {t("button.yes")}
        </Button>
      </div>
    </div>
  );
}
