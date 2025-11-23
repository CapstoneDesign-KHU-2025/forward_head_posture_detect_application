// src/components/organisms/home/ChallengePanel.tsx
"use client";

import * as React from "react";
import dynamic from "next/dynamic";

// 3DModel은 클라이언트 전용이므로 ssr: false
const ThreeDModel = dynamic(() => import("@/components/molecules/3DModel"), {
  ssr: false,
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

export default function ChallengePanel({
  userAng,
  title = "당신의 거북목 도전기",
  description = "3D 모델링으로 추후 삽입",
  illustration,
}: ChallengePanelProps) {
  const [characterId, setCharacterId] = React.useState<string>("remy");

  // 컴포넌트 마운트 시 선택한 캐릭터 읽기
  React.useEffect(() => {
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
    <div className="rounded-[20px] bg-white p-8 shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
      {/* 제목 */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-[#E8F5E9]">
        <h2 className="text-[1.5rem] font-bold text-[#2D5F2E]">{title}</h2>
      </div>

      {/* 3D 모델 영역 - 기존 ThreeDModel 사용 */}
      <div className="bg-[#2C3E50] rounded-xl p-8 min-h-[500px] flex flex-col justify-between relative mb-4">
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <ThreeDModel characterId={characterId} idealAng={idealAng} userAng={userAng ?? idealAng} />
        </div>
      </div>

      {/* 설명 */}
      <p className="text-center mt-6 pt-6 border-t border-[#E8F5E9] text-[0.9rem] text-[#4F4F4F]">{description}</p>

      {/* (옵션) 추가 일러스트/컨텐츠 */}
      {illustration}
    </div>
  );
}
