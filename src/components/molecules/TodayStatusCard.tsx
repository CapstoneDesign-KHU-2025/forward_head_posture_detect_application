"use client";
import { Card } from "@/components/atoms/Card";
import { useTranslations } from "next-intl";
type StatusType = "excellent" | "normal" | "bad" | "empty";

type TodayStatusCardProps = {
  warningCount?: number | null;
  isNewUser?: boolean;
};

export default function TodayStatusCard({ warningCount, isNewUser }: TodayStatusCardProps) {
  const t = useTranslations("TodayStatusCard");
  type StatusInfo = {
    emoji: string;
    title: string;
    message: string;
    statusClass: StatusType;
  };

  function getStatusInfo(warningCount: number | null | undefined, isNewUser: boolean = false): StatusInfo {
    if (warningCount === null || warningCount === undefined) {
      if (isNewUser === true) {
        return {
          emoji: "👋",
          title: t("first_empty.title"),
          message: t("first_empty.message"),
          statusClass: "empty",
        };
      } else {
        return {
          emoji: "☀️",
          title: t("empty.title"),
          message: t("empty.message"),
          statusClass: "empty",
        };
      }
    }

    if (warningCount <= 10) {
      return {
        emoji: "🎉",
        title: t("excellent.title"),
        message: t("excellent.message"),
        statusClass: "excellent",
      };
    } else if (warningCount <= 20) {
      return {
        emoji: "😐",
        title: t("normal.title"),
        message: t("normal.message"),
        statusClass: "normal",
      };
    } else {
      return {
        emoji: "😰",
        title: t("bad.title"),
        message: t("bad.message"),
        statusClass: "bad",
      };
    }
  }
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
<<<<<<< HEAD
      className="status-card flex flex-1 flex-col items-center justify-center px-6 py-5"
=======
      className="status-card flex flex-1 min-h-0 flex-col items-center justify-center px-6 py-5"
>>>>>>> 7b734bc7f583a4228942612f5b99e463e8dd6c18
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
