import { Icon } from "@/components/atoms/Icon";
import { Video } from "lucide-react";

type LoadingSkeletonProps = {
  variant?: "card" | "camera";
};

export default function LoadingSkeleton({ variant = "card" }: LoadingSkeletonProps) {
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
          <p className="text-[18px] font-bold text-[var(--text)]">카메라 연결 중</p>
          <p className="text-[14px] text-[var(--text-muted)]">잠시만 기다려주세요</p>
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
    <div
      role="status"
      aria-live="polite"
      className="flex h-full w-full items-center justify-center"
    >
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
