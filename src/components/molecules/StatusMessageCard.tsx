"use client";

import * as React from "react";

type StatusType = "excellent" | "normal" | "bad" | "empty";

type StatusMessageCardProps = {
  warningCount?: number | null; // null이면 데이터 없음
  isNewUser?: boolean; // true: 완전 신규, false: 오늘 첫 방문 (기존 사용자)
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

export default function StatusMessageCard({ warningCount, isNewUser }: StatusMessageCardProps) {
  const statusInfo = getStatusInfo(warningCount, isNewUser);

  const statusStyles: Record<StatusType, { borderColor: string; background: string }> = {
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
    empty: {
      borderColor: "#9CA3AF",
      background: "linear-gradient(135deg, #ffffff 0%, #F9FAFB 100%)",
    },
  };

  const style = statusStyles[statusInfo.statusClass];

  return (
    <div
      className="status-card"
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
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .status-emoji {
          font-size: ${statusInfo.statusClass === "empty" ? "3.5rem" : "4rem"};
          margin-bottom: 1rem;
          animation: bounce 2s infinite;
        }
      `}</style>
      <div className="status-emoji">{statusInfo.emoji}</div>
      <div
        style={{
          fontSize: statusInfo.statusClass === "empty" ? "1.6rem" : "1.8rem",
          fontWeight: "bold",
          color: statusInfo.statusClass === "empty" ? "#4F4F4F" : "#2D5F2E",
          marginBottom: "0.8rem",
        }}
      >
        {statusInfo.title}
      </div>
      <div
        style={{
          fontSize: statusInfo.statusClass === "empty" ? "1rem" : "1.1rem",
          color: statusInfo.statusClass === "empty" ? "#6B7280" : "#4F4F4F",
          lineHeight: "1.6",
          whiteSpace: "pre-line",
        }}
      >
        {statusInfo.message}
      </div>
    </div>
  );
}
