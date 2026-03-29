"use client";

import { Button } from "@/components/atoms/Button";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type TrialLoginPromptModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function TrialLoginPromptModal({ isOpen, onClose }: TrialLoginPromptModalProps) {
  const t = useTranslations("Trial.loginPrompt");
  const router = useRouter();

  if (!isOpen) return null;

  const goLogin = () => {
    onClose();
    router.push("/login");
  };

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label={t("closeAria")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="trial-login-prompt-title"
        className="relative z-[1] w-full max-w-[400px] rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] ring-1 ring-[var(--green-border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="trial-login-prompt-title" className="text-lg font-bold text-[var(--green-dark)]">
          {t("title")}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-sub)]">{t("body")}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row-reverse sm:justify-stretch">
          <Button size="lg" variant="primary" className="w-full sm:flex-1" onClick={goLogin}>
            {t("login")}
          </Button>
          <Button size="lg" variant="secondary" className="w-full sm:flex-1" onClick={onClose}>
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
