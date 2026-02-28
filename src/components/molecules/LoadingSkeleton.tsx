type LoadingSkeletonProps = {
  variant?: "card" | "camera";
};

export default function LoadingSkeleton({ variant = "card" }: LoadingSkeletonProps) {
  if (variant === "camera") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-[20px] bg-[var(--green-pale)]"
      >
        {/* 카메라 아이콘 */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--green-light)]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--green)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </div>

        {/* 텍스트 */}
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-[13px] font-bold text-[var(--text)]">카메라 연결 중</p>
          <p className="text-[11px] text-[var(--text-muted)]">잠시만 기다려주세요</p>
        </div>

        {/* 점 3개 */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[var(--green-mid)] animate-dot-bounce"
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
