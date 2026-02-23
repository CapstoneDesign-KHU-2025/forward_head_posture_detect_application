"use client";

import { cn } from "@/utils/cn";

type StatusType = "excellent" | "normal" | "bad" | "empty";

type TodayStatusCardProps = {
  warningCount?: number | null; // null이면 데이터 없음
  isNewUser?: boolean; // true: 완전 신규, false: 오늘 첫 방문 (기존 사용자)
  className?: string;
};

type StatusInfo = {
  emoji: string;
  title: string;
  message: string;
  statusClass: StatusType;
};

function getStatusInfo(warningCount: number | null | undefined, isNewUser: boolean = false): StatusInfo {
  // warningCount가 null이거나 undefined면 오늘 데이터 없음
  if (warningCount === null || warningCount === undefined) {
    if (isNewUser === true) {
      // 완전 신규 사용자 (localStorage에 hasEverMeasured가 없음)
      return {
        emoji: "👋",
        title: "환영합니다!",
        message: '"첫 측정을 시작해서\n건강한 자세 습관을 만들어보세요!"',
        statusClass: "empty",
      };
    } else {
      // 오늘 첫 방문 (기존 사용자지만 오늘은 아직 측정 안 함)
      return {
        emoji: "☀️",
        title: "오늘도 화이팅!",
        message: '"오늘의 측정을 시작해서\n좋은 기록을 만들어보세요!"',
        statusClass: "empty",
      };
    }
  }

  // 경고 횟수에 따른 상태 분류
  if (warningCount <= 10) {
    return {
      emoji: "🎉",
      title: "오늘은 최고예요!",
      message: '"목이 시원하시겠어요!"',
      statusClass: "excellent",
    };
  } else if (warningCount <= 20) {
    return {
      emoji: "😐",
      title: "조금만 더 신경 써볼까요?",
      message: '"목을 좀 펴주세요!"',
      statusClass: "normal",
    };
  } else {
    return {
      emoji: "😰",
      title: "오늘은 많이 힘드시겠어요",
      message: '"목을 쉬게 해주세요!"',
      statusClass: "bad",
    };
  }
}

export default function TodayStatusCard({ warningCount, isNewUser, className }: TodayStatusCardProps) {
  const statusInfo = getStatusInfo(warningCount, isNewUser);

  // 신규/오늘 첫 측정일 때
  if (statusInfo.statusClass === "empty") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center text-center",
          "rounded-[18px] shadow-[0_4px_16px_rgba(74,124,89,0.2)]",
          "bg-gradient-to-br from-[#4a7c59] to-[#6aab7a]",
          "px-6 py-6 sm:px-8 sm:py-7 text-white",
          className
        )}
      >
        <div className="mb-2 text-[32px] sm:text-[36px] animate-bounce-slow">{statusInfo.emoji}</div>
        <div
          className="mb-1 text-[18px] font-extrabold sm:text-[19px]"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          {statusInfo.title}
        </div>
        <div className="text-[13px] leading-relaxed text-[rgba(255,255,255,0.85)] whitespace-pre-line">
          {statusInfo.message}
        </div>
      </div>
    );
  }

  // 자세 좋음/보통/나쁨
  const statusStyles: Record<Exclude<StatusType, "empty">, { borderColor: string; background: string }> = {
    excellent: {
      borderColor: "#4A9D4D",
      background: "linear-gradient(135deg, #ffffff 0%, #E8F5E9 100%)",
    },
    normal: {
      borderColor: "#FFA726",
      background: "linear-gradient(135deg, #ffffff 0%, #FFF9E6 100%)",
    },
    bad: {
      borderColor: "#FF7043",
      background: "linear-gradient(135deg, #ffffff 0%, #FFE8E0 100%)",
    },
  };

  const style = statusStyles[statusInfo.statusClass];

  return (
    <div
      className={cn("status-card", className)}
      style={{
        background: style.background,
        padding: "2.5rem 2rem",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        textAlign: "center",
        border: `3px solid ${style.borderColor}`,
        transition: "all 0.3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(45, 95, 46, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
      }}
    >
      <div className="mb-2 text-[32px] sm:text-[36px] animate-bounce-slow">{statusInfo.emoji}</div>
      <div
        className="mb-1 text-[18px] font-extrabold text-[#2D5F2E] sm:text-[19px]"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        {statusInfo.title}
      </div>
      <div className="text-[13px] leading-relaxed text-[#4F4F4F] whitespace-pre-line">
        {statusInfo.message}
      </div>
    </div>
  );
}
