// src/components/organisms/home/ChallengePanel.tsx
'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

// 3DModel은 클라이언트 전용이므로 ssr: false
const ThreeDModel = dynamic(() => import('@/components/molecules/3DModel'), {
  ssr: false,
});

type ChallengePanelProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  illustration?: React.ReactNode; // 옵션
};

export default function ChallengePanel({
  title = '당신의 거북목 도전기',
  description = '3D 모델링으로 추후 삽입',
  illustration,
}: ChallengePanelProps) {
  return (
    <div className="rounded-[20px] bg-white p-8 shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
      {/* 제목 */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-[#E8F5E9]">
        <h2 className="text-[1.5rem] font-bold text-[#2D5F2E]">{title}</h2>
      </div>

      {/* 3D 모델 영역 - 기존 ThreeDModel 사용 */}
      <div className="bg-[#2C3E50] rounded-xl p-8 min-h-[500px] flex flex-col justify-between relative mb-4">
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <ThreeDModel />
        </div>
      </div>

      {/* 설명 */}
      <p className="text-center mt-6 pt-6 border-t border-[#E8F5E9] text-[0.9rem] text-[#4F4F4F]">{description}</p>

      {/* (옵션) 추가 일러스트/컨텐츠 */}
      {illustration}
    </div>
  );
}
