"use client";
import { Card } from "@/components/Card";
import { useTranslations } from "next-intl";

type StatusType = "excellent" | "normal" | "bad" | "empty";

type TodayStatusCardProps = {
  warningCount?: number | null;
  isNewUser?: boolean;
};

export default function TodayStatusCard({ warningCount, isNewUser = false }: TodayStatusCardProps) {
  const t = useTranslations("TodayStatusCard");

  function getStatusInfo(
    warningCount: number | null | undefined,
    isNewUser: boolean,
  ): { emoji: string; title: string; message: string; statusClass: StatusType } {
    if (warningCount === null || warningCount === undefined) {
      if (isNewUser) {
        return { emoji: "👋", title: t("first_empty.title"), message: t("first_empty.message"), statusClass: "empty" };
      }
      return { emoji: "☀️", title: t("empty.title"), message: t("empty.message"), statusClass: "empty" };
    }

    if (warningCount <= 10) {
      return { emoji: "🎉", title: t("excellent.title"), message: t("excellent.message"), statusClass: "excellent" };
    } else if (warningCount <= 20) {
      return { emoji: "😐", title: t("normal.title"), message: t("normal.message"), statusClass: "normal" };
    } else {
      return { emoji: "😰", title: t("bad.title"), message: t("bad.message"), statusClass: "bad" };
    }
  }

  const statusInfo = getStatusInfo(warningCount, isNewUser);

  const styleKey =
    statusInfo.statusClass === "empty" ? (isNewUser ? "empty-new" : "empty-old") : statusInfo.statusClass;
  const styleMap: Record<string, { card: string; border: string; title: string; message: string }> = {
    excellent: {
      card: "bg-[linear-gradient(135deg,#d4f0dc_0%,#e8f8ee_100%)]",
      border: "border-2 border-[#6aab7a]",
      title: "text-[var(--green)]",
      message: "text-[var(--text-sub)]",
    },
    normal: {
      card: "bg-[linear-gradient(135deg,#fff8e6_0%,#fffcf0_100%)]",
      border: "border-2 border-[#f0c040]",
      title: "text-[#b88a00]",
      message: "text-[var(--text-sub)]",
    },
    bad: {
      card: "bg-[linear-gradient(135deg,#fff0ee_0%,#fff5f4_100%)]",
      border: "border-2 border-[#ff8c8c]",
      title: "text-[#c0392b]",
      message: "text-[var(--text-sub)]",
    },
    "empty-new": {
      card: "bg-[linear-gradient(135deg,#c8ecd4_0%,#e4f5e8_100%)]",
      border: "border-none",
      title: "text-[#3a6147]",
      message: "text-[var(--text-sub)]",
    },
    "empty-old": {
      card: "bg-[linear-gradient(135deg,#4a7c59_0%,#6aab7a_100%)]",
      border: "border-none",
      title: "text-[#ffffff]",
      message: "text-[rgba(255,255,255,0.85)]",
    },
  };
  const currentStyles = styleMap[styleKey];

  return (
    <Card className={`flex flex-1 flex-col items-center justify-center px-6 py-5 text-center ${currentStyles.card}`}>
      <div className="text-[2.25rem] mb-[10px] animate-bounce-slow">{statusInfo.emoji}</div>
      <div className={`font-['Nunito',_sans-serif] text-[18px] font-extrabold mb-[6px] ${currentStyles.title}`}>
        {statusInfo.title}
      </div>

      <div className={`text-[13px] font-normal leading-[1.6] whitespace-pre-line ${currentStyles.message}`}>
        {statusInfo.message}
      </div>
    </Card>
  );
}
