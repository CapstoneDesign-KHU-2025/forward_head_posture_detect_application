"use client";

type TitleCardProps = {
  goodDays: number; // 누적 좋은 날 (경고 10회 이하인 날)
};

type BadgeInfo = {
  icon: string;
  title: string;
  bgGradient: string;
  borderColor: string;
};

function getBadgeInfo(goodDays: number): BadgeInfo {
  if (goodDays <= 10) {
    return {
      icon: "🐢",
      title: '"거북이 탈출 시작"',
      bgGradient: "linear-gradient(135deg, #E8F5E9 0%, #F0F9F0 100%)",
      borderColor: "#7BC67E",
    };
  } else if (goodDays <= 20) {
    return {
      icon: "🦒",
      title: '"기린 목 지망생"',
      bgGradient: "linear-gradient(135deg, #FFF9E6 0%, #FFFBF0 100%)",
      borderColor: "#F59E0B",
    };
  } else {
    return {
      icon: "👑",
      title: '"자세왕"',
      bgGradient: "linear-gradient(135deg, #FEF3C7 0%, #FEF9E6 100%)",
      borderColor: "#D97706",
    };
  }
}

export default function TitleCard({ goodDays }: TitleCardProps) {
  const badgeInfo = getBadgeInfo(goodDays);

  return (
    <div
      className={[
        "badge-card",
        "rounded-xl",
        "flex items-center gap-4",
        "border-l-4",
        "transition-all duration-300",
        "shadow-[0_2px_10px_rgba(0,0,0,0.05)]",
        "hover:shadow-[0_4px_20px_rgba(45,95,46,0.15)] hover:translate-x-1",
      ].join(" ")}
      style={{
        background: badgeInfo.bgGradient,
        borderLeftColor: badgeInfo.borderColor,
        padding: "1.5rem",
      }}
    >
      <style jsx>{`
        @keyframes rotate {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-10deg);
          }
          75% {
            transform: rotate(10deg);
          }
        }
        .badge-icon {
          font-size: 2.5rem;
          animation: rotate 3s ease-in-out infinite;
        }
      `}</style>
      <div className="badge-icon">{badgeInfo.icon}</div>
      <div className="flex-1 flex flex-col gap-1">
        <div className="text-[0.9rem] font-medium text-[#2D5F2E]">{goodDays > 0 && `누적 좋은 날 ${goodDays}일`}</div>
        <div className="text-xl font-extrabold text-[#2D5F2E]">{badgeInfo.title}</div>
      </div>
    </div>
  );
}
