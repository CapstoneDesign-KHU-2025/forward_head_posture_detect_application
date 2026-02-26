"use client";

import { Card } from "@/components/atoms/Card";

type StatusType = "excellent" | "normal" | "bad" | "empty";

type TodayStatusCardProps = {
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

export default function TodayStatusCard({ warningCount, isNewUser }: TodayStatusCardProps) {
  const statusInfo = getStatusInfo(warningCount, isNewUser);

  type StatusStyle = {
    background: string;
    titleColor: string;
    messageColor: string;
    borderColor?: string;
  };

  const statusStyles: Record<Exclude<StatusType, "empty">, StatusStyle> = {
    excellent: {
      background: "linear-gradient(135deg, #d4f0dc 0%, #e8f8ee 100%)",
      borderColor: "#6aab7a",
      titleColor: "var(--green)",
      messageColor: "var(--text-sub)",
    },
    normal: {
      background: "linear-gradient(135deg, #fff8e6 0%, #fffcf0 100%)",
      borderColor: "#f0c040",
      titleColor: "#b88a00",
      messageColor: "var(--text-sub)",
    },
    bad: {
      background: "linear-gradient(135deg, #fff0ee 0%, #fff5f4 100%)",
      borderColor: "#ff8c8c",
      titleColor: "#c0392b",
      messageColor: "var(--text-sub)",
    },
  };

  const style: StatusStyle =
    statusInfo.statusClass === "empty"
      ? isNewUser === true
        ? {
            // 신규 사용자 배너
            background: "linear-gradient(135deg, #c8ecd4 0%, #e4f5e8 100%)",
            titleColor: "#3a6147",
            messageColor: "var(--text-sub)",
          }
        : {
            // 오늘 첫 방문 배너
            background: "linear-gradient(135deg, #4a7c59 0%, #6aab7a 100%)",
            titleColor: "#ffffff",
            messageColor: "rgba(255,255,255,0.85)",
          }
      : statusStyles[statusInfo.statusClass as Exclude<StatusType, "empty">];

  return (
    <Card
      className="status-card flex flex-col items-center justify-center px-6 py-5"
      style={{
        background: style.background,
        border: style.borderColor ? `2px solid ${style.borderColor}` : "none",
        textAlign: "center",
      }}
    >
      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .status-emoji {
          font-size: 2.25rem;
          margin-bottom: 10px;
          animation: bounce 2s infinite;
        }
      `}</style>
      <div className="status-emoji">{statusInfo.emoji}</div>
      <div
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: "18px",
          fontWeight: 800,
          color: style.titleColor,
          marginBottom: "6px",
        }}
      >
        {statusInfo.title}
      </div>
      <div
        style={{
          fontSize: "13px",
          fontWeight: 400,
          color: style.messageColor,
          lineHeight: "1.6",
          whiteSpace: "pre-line",
        }}
      >
        {statusInfo.message}
      </div>
    </Card>
  );
}
