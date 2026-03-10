"use client";

import React, { useEffect, useRef, useState } from "react";

type Placement = "top" | "right" | "bottom" | "left";
type ArrowSide = "top" | "right" | "bottom" | "left";

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

type CoachmarkOverlayProps = {
  open: boolean;
  targetId: string; // data-tour-id 값
  title: string;
  description: string;
  placement?: Placement;
  onClose: () => void;
  onNext?: () => void;
  // 옵션
  allowBackdropClose?: boolean; // 배경 클릭으로 닫기
  zIndex?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
}

export default function CoachmarkOverlay({
  open,
  targetId,
  title,
  description,
  placement = "bottom",
  onClose,
  onNext,
  allowBackdropClose = true,
  zIndex = 9999,
}: CoachmarkOverlayProps) {
  const targetElRef = useRef<HTMLElement | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [ready, setReady] = useState(false);

  // ✅ open 되면 DOM commit 이후 target 찾기(재시도 포함)
  useEffect(() => {
    if (!open) {
      targetElRef.current = null;
      setRect(null);
      setReady(false);
      return;
    }

    let raf = 0;
    let tries = 0;

    const find = () => {
      const el = document.querySelector(`[data-tour-id="${targetId}"]`) as HTMLElement | null;

      if (el) {
        targetElRef.current = el;
        setRect(getRect(el));
        setReady(true);

        // 타겟이 화면 밖이면 보여주기(부드럽게)
        try {
          el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
        } catch {
          // ignore
        }
        return;
      }

      tries += 1;
      if (tries < 120) {
        // 최대 약 2초(120프레임) 재시도
        raf = requestAnimationFrame(find);
      } else {
        setReady(true); // 타겟 못 찾았어도 로딩 무한 방지
      }
    };

    raf = requestAnimationFrame(find);
    return () => cancelAnimationFrame(raf);
  }, [open, targetId]);

  // ✅ 스크롤/리사이즈/타겟 크기변화 시 rect 갱신
  useEffect(() => {
    if (!open) return;
    const el = targetElRef.current;
    if (!el) return;

    const compute = () => setRect(getRect(el));

    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);

    const ro = new ResizeObserver(compute);
    ro.observe(el);

    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
      ro.disconnect();
    };
  }, [open]);

  if (!open) return null;

  // 타겟 못 찾았을 때: 안전 처리
  if (!rect) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50" style={{ zIndex }}>
        <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold">
          {ready ? "튜토리얼 타겟을 찾지 못했어요." : "Loading tutorial…"}
          <button className="ml-3 underline opacity-70 hover:opacity-100" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    );
  }

  // ===== spotlight 박스 =====
  const pad = 8;
  const spotlight = {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };

  // ===== bubble 위치 계산 =====
  const bubbleW = 320;
  const gap = 12;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const bubble = (() => {
    if (placement === "top") {
      const top = rect.top - gap;
      const left = clamp(centerX - bubbleW / 2, 12, window.innerWidth - bubbleW - 12);
      return { top, left, transform: "translateY(-100%)", arrow: "bottom" as ArrowSide };
    }
    if (placement === "right") {
      const left = rect.right + gap;
      const top = clamp(centerY - 90, 12, window.innerHeight - 220);
      return { top, left, transform: "none", arrow: "left" as ArrowSide };
    }
    if (placement === "left") {
      const left = rect.left - gap;
      const top = clamp(centerY - 90, 12, window.innerHeight - 220);
      return { top, left, transform: "translateX(-100%)", arrow: "right" as ArrowSide };
    }
    // bottom
    const top = rect.bottom + gap;
    const left = clamp(centerX - bubbleW / 2, 12, window.innerWidth - bubbleW - 12);
    return { top, left, transform: "none", arrow: "top" as ArrowSide };
  })();

  return (
    <div className="fixed inset-0" style={{ zIndex }}>
      {/* ✅ spotlight: 주변 딤 처리 (box-shadow trick) */}
      <div
        className="fixed rounded-2xl ring-2 ring-white/90"
        style={{
          top: spotlight.top,
          left: spotlight.left,
          width: spotlight.width,
          height: spotlight.height,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          pointerEvents: "none",
        }}
      />

      {/* ✅ 말풍선 */}
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

      {/* ✅ backdrop 클릭 처리 */}
      <button
        aria-label="Close tutorial overlay"
        className="fixed inset-0"
        style={{ background: "transparent" }}
        onClick={allowBackdropClose ? onClose : undefined}
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
  arrow: ArrowSide;
  title: string;
  description: string;
  onClose: () => void;
  onNext?: () => void;
}) {
  return (
    <div className="relative rounded-2xl bg-white p-4 shadow-2xl">
      <Arrow arrow={arrow} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
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

function Arrow({ arrow }: { arrow: ArrowSide }) {
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
