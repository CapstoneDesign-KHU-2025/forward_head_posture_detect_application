"use client";

import { Button } from "@/components/atoms/Button";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/utils/cn";

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
    <section
      className={cn(
        "flex-shrink-0 flex items-center justify-between overflow-hidden",
        "h-[270px] rounded-[18px] bg-white px-[80px] py-7",
        "shadow-[0_4px_20px_rgba(74,124,89,0.12)]",
        className
      )}
    >
      <div className="greeting-text">
        <h1
          className="mb-2 text-[1.6rem] font-extrabold"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          <span className="text-[#4a7c59]">{userName}</span> 님, 안녕하세요!
        </h1>
        <p className="text-sm leading-relaxed text-[#7a9585]">
          오늘도 바른 자세로 하루를 시작해봐요 🐢
        </p>
      </div>
      <Button onClick={handlePrimaryAction} className="flex-shrink-0">
        측정하기
      </Button>
    </section>
  );
}
