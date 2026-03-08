"use client";
import { Icon } from "@/components/atoms/Icon";
import { Video } from "lucide-react";
import { useTranslations } from "next-intl";

type LoadingSkeletonProps = {
  variant?: "card" | "camera" | "home";
};

export default function LoadingSkeleton({ variant = "card" }: LoadingSkeletonProps) {
  const t = useTranslations("LoadingSkeleton");

  if (variant === "home") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--green-pale)]"
      >
        <div className="text-[80px] leading-none animate-turtle-walk">🐢</div>
        <div className="mt-5 font-black text-2xl text-[var(--green)] tracking-tight" style={{ fontFamily: "Nunito, sans-serif" }}>
          {t("brand")}
        </div>
        <div className="mt-7 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[var(--green-border)] animate-loading-dot-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "camera") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex h-full w-full flex-col items-center justify-center gap-6 rounded-[20px] bg-white"
      >
        {/* 카메라 아이콘 */}
        <Icon size="2xl" className="text-[var(--green)]">
          <Video strokeWidth={2} />
        </Icon>

        {/* 텍스트 */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-[18px] font-bold text-[var(--text)]">{t("message")}</p>
          <p className="text-[14px] text-[var(--text-muted)]">{t("description")}</p>
        </div>

        {/* 점 3개 */}
        <div className="flex items-center gap-2.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-full bg-[var(--green-mid)] animate-dot-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // variant="card" (기본값)
  return (
    <div role="status" aria-live="polite" className="flex h-full w-full items-center justify-center">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-[var(--green-mid)] animate-dot-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
