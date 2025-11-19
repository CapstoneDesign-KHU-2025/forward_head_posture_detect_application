"use client";

import * as React from "react";

type BadgeCardProps = {
  /** 누적 좋은 날 수 (경고 5회 이하인 날) */
  goodDays: number;
  className?: string;
};

type BadgeConfig = {
  icon: string;
  title: string;
  bgGradient: string;
  borderColor: string;
  labelColor: string;
  titleColor: string;
};

const BADGE_CONFIGS: BadgeConfig[] = [
  {
    icon: "🐢",
    title: '"거북이 탈출 준비 중"',
    bgGradient: "linear-gradient(135deg, #FFF9E6 0%, #FFFBF0 100%)",
    borderColor: "#FFC107",
    labelColor: "#92400E",
    titleColor: "#D97706",
  },
  {
    icon: "🐢",
    title: '"거북이 탈출 시작"',
    bgGradient: "linear-gradient(135deg, #E8F5E9 0%, #F0F9F0 100%)",
    borderColor: "#7BC67E",
    labelColor: "#2D5F2E",
    titleColor: "#4A9D4D",
  },
  {
    icon: "🦕",
    title: '"목 펴기 도전자"',
    bgGradient: "linear-gradient(135deg, #E8F5E9 0%, #F0F9F0 100%)",
    borderColor: "#4A9D4D",
    labelColor: "#2D5F2E",
    titleColor: "#2D5F2E",
  },
  {
    icon: "🦒",
    title: '"기린 목 지망생"',
    bgGradient: "linear-gradient(135deg, #FFF9E6 0%, #FFFBF0 100%)",
    borderColor: "#F59E0B",
    labelColor: "#92400E",
    titleColor: "#D97706",
  },
  {
    icon: "🦅",
    title: '"독수리 자세"',
    bgGradient: "linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)",
    borderColor: "#3B82F6",
    labelColor: "#1E40AF",
    titleColor: "#2563EB",
  },
  {
    icon: "👑",
    title: '"자세왕"',
    bgGradient: "linear-gradient(135deg, #FEF3C7 0%, #FEF9E6 100%)",
    borderColor: "#D97706",
    labelColor: "#92400E",
    titleColor: "#D97706",
  },
];

function getBadgeConfig(goodDays: number): BadgeConfig {
  if (goodDays === 0) return BADGE_CONFIGS[0];
  if (goodDays < 3) return BADGE_CONFIGS[1];
  if (goodDays < 7) return BADGE_CONFIGS[2];
  if (goodDays < 15) return BADGE_CONFIGS[3];
  if (goodDays < 30) return BADGE_CONFIGS[4];
  return BADGE_CONFIGS[5];
}

export default function BadgeCard({ goodDays, className }: BadgeCardProps) {
  const config = getBadgeConfig(goodDays);

  return (
    <div
      className={[
        "rounded-xl",
        "shadow-[0_2px_10px_rgba(0,0,0,0.05)]",
        "flex items-center gap-4",
        "px-5 py-5",
        "transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(245,158,11,0.2)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: config.bgGradient,
        borderLeft: `4px solid ${config.borderColor}`,
      }}
    >
      {/* 아이콘 */}
      <div className="text-4xl animate-rotate-slow">{config.icon}</div>

      {/* 정보 */}
      <div className="flex-1 text-left">
        <div className="text-[0.8rem] mb-1" style={{ color: config.labelColor }}>
          나의 칭호 {goodDays > 0 && <span>(누적 좋은 날 {goodDays}일)</span>}
        </div>
        <div className="text-[1.1rem] font-bold" style={{ color: config.titleColor }}>
          {config.title}
        </div>
      </div>
    </div>
  );
}

