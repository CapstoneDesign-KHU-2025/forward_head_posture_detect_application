"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useRouter } from "@/i18n/navigation";
import { useCallback } from "react";
import { useTranslations } from "next-intl";
type WelcomeHeroProps = {
  userName?: string;
  onPrimaryAction?: () => void;
  className?: string;
};

export default function WelcomeHero({ userName = "User", onPrimaryAction, className }: WelcomeHeroProps) {
  const t = useTranslations("WelcomeHero");
  const router = useRouter();
  const handlePrimaryAction = useCallback(() => {
    if (onPrimaryAction) {
      onPrimaryAction();
      return;
    }
    router.push("/estimate");
  }, [onPrimaryAction, router]);

  return (
    <section className={className}>
      <Card className="w-full h-[270px] flex-shrink-0 flex items-center justify-between py-[28px] px-[80px] overflow-hidden gap-3">
        <div className="greeting-text">
          <h1 className="flex items-baseline text-[27px] font-black mb-2" style={{ fontFamily: "Nunito, sans-serif" }}>
            <span className="text-[var(--green)] inline-block max-w-[150px] sm:max-w-[250px] truncate mr-2">
              {userName}
            </span>
            <span className="shrink-0">{t("hello")}</span>
          </h1>
          <p className="text-[14px] font-semibold text-[var(--text-sub)] leading-relaxed">{t("title")}</p>
        </div>
        <Button size="lg" onClick={handlePrimaryAction} className="flex-shrink-0 py-3.5 px-8">
          {t("button")}
        </Button>
      </Card>
    </section>
  );
}
