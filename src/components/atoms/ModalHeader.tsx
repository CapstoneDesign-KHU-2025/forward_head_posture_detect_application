"use client";

type ModalHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
};

export function ModalHeader({ title, subtitle, icon, onClose }: ModalHeaderProps) {
  return (
    <header className="flex shrink-0 items-start justify-between px-6 pt-[22px] pb-[8px]">
      <div>
        <h2
          className="mb-1.5 flex items-center gap-2 text-[20px] font-black leading-tight text-[#2d3b35]"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          {icon}
          {title}
        </h2>
        {subtitle && <p className="text-sm text-[#7a9585]">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-[#d4ead9] bg-[#f4faf6] text-xs text-[#7a9585] transition-colors hover:bg-[#e8f5ec]"
        aria-label="모달 닫기"
      >
        ✕
      </button>
    </header>
  );
}
