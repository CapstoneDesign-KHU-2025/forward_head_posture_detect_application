"use client";

import { Computer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Placement = "top" | "right" | "bottom" | "left";

type CoachmarkOverlayProps = {
  open: boolean;
  targetId: string;
  title: string;
  description: string;
  placement?: Placement;
  onClose: () => void;
  onNext?: () => void;
};

type Rect = { top: number; left: number; width: number; height: number; right: number; bottom: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function CoachmarkOverlay({
  open,
  targetId,
  title,
  description,
  placement = "bottom",
  onClose,
  onNext,
}: CoachmarkOverlayProps) {
  const [rect, setRect] = useState<Rect | null>(null);

  const targetEl = useMemo(() => {
    if (!open) return null;
    if (typeof document === "undefined") return null;

    return document.querySelector(`[data-tour-id="${targetId}"]`) as HTMLElement | null;
  }, [open, targetId]);

  useEffect(() => {
    if (!open || !targetEl) {
      setRect(null);
      return;
    }
    const compute = () => {
      const r = targetEl.getBoundingClientRect();
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        right: r.right,
        bottom: r.bottom,
      });
    };

    compute();

    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);

    const ro = new ResizeObserver(compute);
    ro.observe(targetEl);

    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
      ro.disconnect();
    };
  }, [open, targetEl]);

  if (!open) return null;

  if (!rect) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
        <div className="rounded-2xl bg-white p-4 text-sm">Loading tutorial…</div>
      </div>
    );
  }

  const pad = 6;
  const highlight = {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };

  const bubbleW = 320;
  const bubbleGap = 12;

  const bubble = (() => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    switch (placement) {
      case "top": {
        const top = rect.top - bubbleGap;
        const left = clamp(centerX - bubbleW / 2, 12, window.innerWidth - bubbleW - 12);
        return { top, left, transform: "translateY(-100%)", arrow: "bottom" as const };
      }
      case "right": {
        const top = clamp(centerY - 70, 12, window.innerHeight - 160);
        const left = rect.right + bubbleGap;
        return { top, left, transform: "none", arrow: "left" as const };
      }
      case "left": {
        const top = clamp(centerY - 70, 12, window.innerHeight - 160);
        const left = rect.left - bubbleGap;
        return { top, left, transform: "translateX(-100%)", arrow: "right" as const };
      }
      case "bottom":
      default: {
        const top = rect.bottom + bubbleGap;
        const left = clamp(centerX - bubbleW / 2, 12, window.innerWidth - bubbleW - 12);
        return { top, left, transform: "none", arrow: "top" as const };
      }
    }
  })();

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* 딤 처리: highlight box의 shadow로 주변을 어둡게 */}
      <div
        className="fixed rounded-2xl ring-2 ring-white/80"
        style={{
          top: highlight.top,
          left: highlight.left,
          width: highlight.width,
          height: highlight.height,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          pointerEvents: "none",
        }}
      />

      {/* 말풍선 */}
      <div
        className="fixed"
        style={{
          top: bubble.top,
          left: bubble.left,
          transform: bubble.transform,
          width: bubbleW,
          pointerEvents: "auto",
        }}
      >
        <CoachBubble arrow={bubble.arrow} title={title} description={description} onClose={onClose} onNext={onNext} />
      </div>

      {/* 배경 클릭 닫기(원하면) */}
      <button
        aria-label="Close tutorial overlay"
        className="fixed inset-0 cursor-default"
        onClick={onClose}
        style={{ background: "transparent" }}
      />
    </div>
  );
}
function CoachBubble({
  arrow,
  title,
  description,
  onClose,
  onNext,
}: {
  arrow: "top" | "right" | "bottom" | "left";
  title: string;
  description: string;
  onClose: () => void;
  onNext?: () => void;
}) {
  return (
    <div className="relative rounded-2xl bg-white p-4 shadow-xl">
      <Arrow arrow={arrow} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-[var(--text)]">{title}</div>
          <div className="mt-1 text-[13px] leading-relaxed text-[var(--text-sub)]">{description}</div>
        </div>

        <button onClick={onClose} className="h-8 w-8 shrink-0 rounded-full hover:bg-black/5" aria-label="Close">
          ✕
        </button>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button onClick={onClose} className="rounded-xl px-3 py-2 text-sm font-semibold hover:bg-black/5">
          닫기
        </button>
        {onNext ? (
          <button
            onClick={onNext}
            className="rounded-xl bg-[var(--green)] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            다음
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Arrow({ arrow }: { arrow: "top" | "right" | "bottom" | "left" }) {
  // 말풍선 화살표(삼각형)
  const base = "absolute h-0 w-0 border-[10px] border-transparent";

  if (arrow === "top") {
    return <div className={`${base} -top-5 left-1/2 -translate-x-1/2 border-b-white`} />;
  }
  if (arrow === "bottom") {
    return <div className={`${base} -bottom-5 left-1/2 -translate-x-1/2 border-t-white`} />;
  }
  if (arrow === "left") {
    return <div className={`${base} -left-5 top-8 border-r-white`} />;
  }
  return <div className={`${base} -right-5 top-8 border-l-white`} />;
}
