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
      <Card className="w-full text-center py-12 mb-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-[2rem] font-bold mb-2">
            <span className="text-[#4A9D4D]">{userName}</span> 님, 안녕하세요.
          </h1>
          <p className="text-[1.1rem] text-[#4F4F4F] mb-6">거북거북!</p>

          <div className="flex justify-center">
            <Button size="lg" onClick={handlePrimaryAction}>
              측정하기
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
