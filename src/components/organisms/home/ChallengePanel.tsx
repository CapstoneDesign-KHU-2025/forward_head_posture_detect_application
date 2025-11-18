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
export default function ChallengePanel({
  userAng,
  title = "당신의 거북목 도전기",
  description = "3D 모델링으로 추후 삽입",
  illustration,
}: ChallengePanelProps) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-6">
      {/* 제목 */}
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      {/* 3D 모델 영역 */}
      <div className="relative h-[420px] border border-dashed border-black/20 rounded-md mb-4 overflow-hidden">
        <ThreeDModel userAng={userAng ? userAng : idealAng} idealAng={idealAng} />
      </div>

      {/* 설명 */}
      <p className="text-sm text-center text-black/60">{description}</p>

      {/* (옵션) 추가 일러스트/컨텐츠 */}
      {illustration}
    </div>
  );
}
