"use client";

import { useEffect, useState } from "react";

/** HTML 로딩 화면과 동일한 스타일의 초기 로딩 스크린 */
export default function LoadingScreen() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");

  useEffect(() => {
    const showTimer = setTimeout(() => setPhase("fade"), 2000);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (phase !== "fade") return;
    const hideTimer = setTimeout(() => setPhase("gone"), 600);
    return () => clearTimeout(hideTimer);
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      id="loading-screen"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--green-pale)] transition-opacity duration-[600ms] ease-out ${
        phase === "fade" ? "opacity-0 pointer-events-none" : ""
      }`}
      style={{ fontFamily: "Nunito, sans-serif" }}
      aria-hidden="true"
    >
      {/* 거북이 이모지 - 위아래로 움직이는 애니메이션 */}
      <div className="text-[80px] leading-none animate-turtle-walk">
        🐢
      </div>
      {/* 브랜드 텍스트 */}
      <div className="mt-5 text-2xl font-black text-[var(--green)] tracking-[-0.5px]">
        거북목 거북거북!
      </div>
      {/* 서브 텍스트 */}
      <div className="mt-1.5 text-[13px] text-[var(--text-muted)]">
        바른 자세를 위한 첫 걸음 🌿
      </div>
      {/* 로딩 점 3개 */}
      <div className="mt-4 flex gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--green-border)] animate-dot-pulse-1" />
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--green-border)] animate-dot-pulse-2" />
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--green-border)] animate-dot-pulse-3" />
      </div>
    </div>
  );
}
