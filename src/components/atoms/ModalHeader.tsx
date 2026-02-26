"use client";

import { IconButton } from "@/components/atoms/IconButton";

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
        <IconButton
          variant="outline"
          icon={<span className="leading-none text-[20px]">×</span>}
          onClick={onClose}
          aria-label="모달 닫기"
        />
      </div>
    </header>
  );
}

