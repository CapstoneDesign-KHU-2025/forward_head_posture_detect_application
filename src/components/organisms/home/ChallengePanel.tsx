// src/components/organisms/home/ChallengePanel.tsx
'use client';

// src/components/organisms/home/ChallengePanel.tsx
import * as React from "react";
import dynamic from "next/dynamic";

// ✅ 3DModel.tsx는 클라이언트 전용이라 ssr:false로 불러와야 함
const ThreeDModel = dynamic(() => import("@/components/molecules/3DModel"), {
  ssr: false,
});

type ChallengePanelProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
};

export default function ChallengePanel({
  title = "당신의 거북목 도전기",
  description = "3D 모델링으로 추후 삽입",
}: ChallengePanelProps) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-6">
      {/* 제목 */}
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      {/* ✅ 3D 모델 삽입 영역 */}
      <div className="relative h-[420px] border border-dashed border-black/20 rounded-md mb-4 overflow-hidden">
        <ThreeDModel />
      </div>

      {/* 설명 */}
      <p className="text-sm text-center text-black/60">{description}</p>
    </div>
  );
}
