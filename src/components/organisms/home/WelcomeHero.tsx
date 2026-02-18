"use client";

import { Button } from "@/components/atoms/Button";
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
    <section
      className={[
        "w-full rounded-[20px] bg-white text-center",
        "py-12 mb-8",
        "shadow-[0_2px_20px_rgba(45,95,46,0.08)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto max-w-4xl">
        <h1 className="text-[2rem] font-bold mb-2">
          <span className="text-[#4A9D4D]">{userName}</span> 님, 안녕하세요.
        </h1>
        <p className="text-[1.1rem] text-[#4F4F4F] mb-6">거북거북!</p>

        <div className="flex justify-center">
          <Button onClick={handlePrimaryAction}>측정하기</Button>
        </div>
      </div>
    </section>
  );
}
