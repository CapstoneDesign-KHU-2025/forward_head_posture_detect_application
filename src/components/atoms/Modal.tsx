"use client";

import { useEffect } from "react";
import { cn } from "@/utils/cn";

function clearBodyScrollLock() {
  document.body.style.removeProperty("--scrollbar-width");
  delete document.body.dataset.modalOpen;
  document.body.style.paddingRight = "";
  document.body.style.overflow = "";
}

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentClassName?: string;
};

export function Modal({ isOpen, onClose, children, contentClassName }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
    document.body.dataset.modalOpen = "true";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // body 스타일 해제는 onTransitionEnd에서 처리 (닫힘 애니메이션 완료 후)
    };
  }, [isOpen, onClose]);

  // 언마운트 시 body 스타일 해제 (닫기 애니메이션 없이 컴포넌트가 사라지는 경우)
  useEffect(() => () => clearBodyScrollLock(), []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4",
        "bg-black/40 transition-opacity duration-200",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
      onTransitionEnd={(e) => {
        if (
          !isOpen &&
          e.target === e.currentTarget &&
          e.propertyName === "opacity"
        ) {
          clearBodyScrollLock();
        }
      }}
    >
      <div
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl",
          "transform transition-all duration-200",
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-2",
          contentClassName
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
