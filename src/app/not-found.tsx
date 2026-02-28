"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100dvh-var(--header-height))] flex-col items-center justify-center gap-6 animate-fade-up">
      <div className="flex items-center justify-center gap-4 leading-none">
        <span
          className="font-black text-[180px] tracking-[-8px] text-[var(--green)]"
          style={{ fontFamily: "Nunito, sans-serif", textShadow: "0 8px 32px rgba(74, 124, 89, 0.2)" }}
        >
          4
        </span>
        <span className="animate-float mx-1 text-[120px] drop-shadow-[0_8px_20px_rgba(74,124,89,0.25)]">
          🐢
        </span>
        <span
          className="font-black text-[180px] tracking-[-8px] text-[var(--green)]"
          style={{ fontFamily: "Nunito, sans-serif", textShadow: "0 8px 32px rgba(74, 124, 89, 0.2)" }}
        >
          4
        </span>
      </div>
      <div
        className="text-center text-[28px] font-black tracking-[-0.5px] text-[var(--text)]"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        페이지를 찾을 수 없어요
      </div>
      <div className="text-center text-[13px] font-semibold uppercase tracking-[1.5px] text-[var(--text-muted)]">
        거북이도 길을 잃었어요. 함께 돌아가요.
      </div>
      <Button size="lg" variant="primary" className="mt-1" onClick={() => router.push("/")}>
        홈으로 돌아가기
      </Button>
    </div>
  );
}
