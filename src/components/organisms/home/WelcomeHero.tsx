"use client";

import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

type WelcomeHeroProps = {
  userName?: string;
  onPrimaryAction?: () => void;
  className?: string;
};

export default function WelcomeHero({ userName = "사용자", onPrimaryAction, className }: WelcomeHeroProps) {
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
      <Card className="w-full h-[270px] flex-shrink-0 flex items-center justify-between py-[28px] px-[80px] overflow-hidden">
        <div className="greeting-text">
          <h1
            className="text-[27px] font-black mb-2"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            <span className="text-[var(--green)]">{userName}</span> 님, 안녕하세요!
          </h1>
          <p className="text-[14px] font-semibold text-[var(--text-sub)] leading-relaxed">
            오늘도 바른 자세로 하루를 시작해봐요 🐢
          </p>
        </div>
        <Button
          size="lg"
          onClick={handlePrimaryAction}
          className="flex-shrink-0 py-3.5 px-8"
        >
          측정하기
        </Button>
      </Card>
    </section>
  );
}
