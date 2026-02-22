"use client";

import { cn } from "@/utils/cn";

type ModalBackdropProps = {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
};

export function ModalBackdrop({ isOpen, onClose, className }: ModalBackdropProps) {
  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-[100] bg-[#2d3b35]/35 backdrop-blur-sm",
        "transition-opacity duration-200",
        className
      )}
      style={{ backdropFilter: "blur(4px)" }}
      onClick={onClose}
    />
  );
}
