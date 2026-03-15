"use client";
import { PictureInPicture2 } from "lucide-react";
import { Button } from "./Button";

type PipToggleButtonProps = {
  isOpen: boolean;
  onClick: () => void;
};

export function PipToggleButton({ isOpen, onClick }: PipToggleButtonProps) {
  return (
    <Button
      onClick={onClick}
      title={isOpen ? "팝업 끄기" : "팝업 열기"}
      className="absolute bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-4xl bg-[var(--green)] text-white backdrop-blur-sm transition-all hover:bg-[rgba(74,124,89,0.7)]/60 hover:scale-105"
    >
      <PictureInPicture2 size={20} className="h-5 w-5 shrink-0 text-white" />
    </Button>
  );
}
