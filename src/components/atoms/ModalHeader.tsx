"use client";

import { Button } from "@/components/atoms/Button";

type ModalHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
};

export function ModalHeader({ title, subtitle, icon, onClose }: ModalHeaderProps) {
  return (
    <header
      className="flex shrink-0 flex-col px-6 pt-5 pb-5"
      style={{ background: "linear-gradient(135deg, #4a7c59 0%, #6aab7a 100%)" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="flex items-center gap-2 font-extrabold text-[20px] text-white"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            {icon}
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-[14px] text-white/75">{subtitle}</p>}
        </div>
        <Button
          type="button"
          variant="icon"
          onClick={onClose}
          className="h-[34px] w-[34px] px-0 rounded-[10px] bg-white/20 text-white hover:bg-white/35 text-[20px] leading-none"
        >
          ×
        </Button>
      </div>
    </header>
  );
}

