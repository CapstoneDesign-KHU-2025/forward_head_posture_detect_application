"use client";

import * as React from "react";
import { Button } from "@/components/atoms/Button";
import { useRouter } from "next/navigation";

type WelcomeHeroProps = {
  userName?: string;
  onPrimaryAction?: () => void;
  className?: string;
};

export default function WelcomeHero({
  userName = "사용자",
  onPrimaryAction,
  className,
}: WelcomeHeroProps) {
  const router = useRouter();
  const handlePrimaryAction = React.useCallback(() => {
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
      ].filter(Boolean).join(" ")}
    >
      <div className="mx-auto max-w-4xl">
        <h1 className="text-[2rem] font-bold mb-2">
          <span className="text-[#4A9D4D]">{userName}</span> 님, 안녕하세요.
        </h1>
        <p className="text-[1.1rem] text-[#4F4F4F] mb-6">거북거북!</p>

        <div className="flex justify-center">
          <button
            onClick={handlePrimaryAction}
            className="bg-[#2D5F2E] text-white border-none px-12 py-4 text-[1.1rem] font-semibold rounded-xl cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(45,95,46,0.2)] hover:bg-[#4A9D4D] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(45,95,46,0.3)]"
          >
            측정하기
          </button>
        </div>
      </div>
    </section>
  );
}