import * as React from "react";

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

      {/* 일러스트 자리 (중앙 정렬) */}
      <div className="flex items-center justify-center h-65 border border-dashed border-black/20 rounded-md mb-4">
        {/* 추후 3D 모델 / 이미지 삽입 */}
        <span className="text-4xl">🧍</span>
      </div>

      {/* 설명 */}
      <p className="text-sm text-center text-black/60">{description}</p>
    </div>
  );
}