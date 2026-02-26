// src/components/organisms/home/Posture3DCard.tsx
"use client";

import { Card } from "@/components/atoms/Card";
import LoadingSkeleton from "@/components/molecules/LoadingSkeleton";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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

export default function Posture3DCard({
  userAng,
  title = "당신의 거북목 도전기",
  description,
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

  const currentAngle = userAng ?? idealAng;
  const delta = currentAngle - idealAng;
  const deltaLabel = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}°`;

  let statusText = "바른 자세 유지 중 👍";
  if (Math.abs(delta) > 5) {
    statusText = "목을 쉬게 해주세요!";
  } else if (Math.abs(delta) > 2) {
    statusText = "조금만 더 신경 써볼까요?";
  }

  return (
    <Card className="p-6 pt-4 flex flex-col gap-4 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-[18px] font-extrabold text-[var(--text)]"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            {title}
          </h2>
          <p className="mt-[2px] text-[12px] font-semibold text-[var(--text-muted)]">5분 단위 평균 목 각도</p>
        </div>
        <div
          className="bg-[var(--green-light)] rounded-full px-4 py-[4px] text-[15px] font-extrabold text-[var(--green)]"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          {currentAngle.toFixed(1)}°
        </div>
      </div>

      {/* 3D 모델 영역 */}
      <div className="flex-1 min-h-[260px] flex flex-col items-center justify-center relative">
        <div className="w-full aspect-[4/3] rounded-[22px] bg-[linear-gradient(180deg,#e8f5ec_0%,#f4faf6_70%,#e0f0e5_100%)] flex items-center justify-center relative overflow-hidden">
          {/* 바닥 그라디언트 느낌 */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(0deg,rgba(74,124,89,0.12)_0%,transparent_100%)]" />

          <div className="relative z-[1] w-full h-full">
            <ThreeDModel
              characterId={characterId}
              idealAng={idealAng}
              userAng={currentAngle}
            />
          </div>
        </div>
      </div>

      {/* (옵션) 추가 일러스트/컨텐츠 */}
      {illustration}
    </Card>
  );
}
