"use client";

import * as React from "react";
import { Button } from "@/components/atoms/button/Button";
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
        "w-full rounded-lg bg-white",
        "px-4 py-10 md:px-6 md:py-12",
        className,
      ].filter(Boolean).join(" ")}
    >
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          {userName} 님, 안녕하세요.
        </h1>
        <p className="mt-3 text-black/60">거북거북!</p>

        <div className="mt-6 flex justify-center">
          <Button onClick={handlePrimaryAction}>측정하기</Button>
        </div>
      </div>
    </section>
  );
}