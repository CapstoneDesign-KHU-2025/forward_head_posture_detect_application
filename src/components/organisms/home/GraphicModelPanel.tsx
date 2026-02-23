// src/components/organisms/home/ChallengePanel.tsx
"use client";

import AsyncBoundary from "@/components/common/AsyncBoundary";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

// 3DModel은 클라이언트 전용이므로 ssr: false
const ThreeDModel = dynamic(() => import("@/components/molecules/3DModel"), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});

type ChallengePanelProps = {
  userAng: number | undefined;
  title?: React.ReactNode;
  description?: React.ReactNode;
  illustration?: React.ReactNode; // 옵션
};

const idealAng = 52;

// localStorage에서 선택한 캐릭터 가져오기
function getSelectedCharacter(): string {
  if (typeof window === "undefined") return "remy";
  const selected = localStorage.getItem("selectedCharacter");
  return selected || "remy"; // 기본값: remy
}

export default function GraphicModelPanel({
  userAng,
  title = "당신의 거북목 도전기",
  description = "5분 단위 평균 목 각도",
  illustration,
}: ChallengePanelProps) {
  const [characterId, setCharacterId] = useState<string>("remy");

  // 컴포넌트 마운트 시 선택한 캐릭터 읽기
  useEffect(() => {
    setCharacterId(getSelectedCharacter());

    // localStorage 변경 감지 (다른 탭이나 페이지에서 변경된 경우)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedCharacter" && e.newValue) {
        setCharacterId(e.newValue);
      }
    };

    // 커스텀 이벤트 감지 (같은 탭에서 캐릭터 변경된 경우)
    const handleCustomStorage = () => {
      setCharacterId(getSelectedCharacter());
    };

    // 페이지 포커스 시 다시 확인 (같은 탭에서 캐릭터 변경 후 돌아온 경우)
    const handleFocus = () => {
      setCharacterId(getSelectedCharacter());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("storage", handleCustomStorage); // 커스텀 이벤트도 감지
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storage", handleCustomStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <section
      className={cn(
        "rounded-[18px] shadow-[0_4px_20px_rgba(74,124,89,0.12)]",
        "bg-gradient-to-b from-white to-[#f0f8f3]",
        "flex flex-col overflow-hidden",
      )}
    >
      {/* 헤더 영역 */}
      <header className="px-5 pt-3">
        <div
          className="text-[14px] font-extrabold text-[#2d3b35]"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          {title}
        </div>
      </header>

      {/* 3D 모델 영역 */}
      <div className="relative mx-5 my-4 flex min-h-[320px] items-center justify-center rounded-[18px] bg-gradient-to-b from-[#e8f5ec] via-[#f4faf6] to-[#e0f0e5] overflow-hidden">
        <div className="absolute inset-0">
          <ThreeDModel characterId={characterId} idealAng={idealAng} userAng={userAng ?? idealAng} />
        </div>
      </div>

      {/* (옵션) 추가 일러스트/컨텐츠 + 하단 영역 */}
      {illustration && <div className="px-5 pb-4">{illustration}</div>}
    </section>
  );
}
