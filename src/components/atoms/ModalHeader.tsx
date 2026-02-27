"use client";

import { X } from "lucide-react";
import { Icon } from "@/components/atoms/Icon";
import { IconButton } from "@/components/atoms/IconButton";

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
      <IconButton
        variant="outline"
        size="sm"
        icon={
          <Icon size="xs">
            <X />
          </Icon>
        }
        onClick={onClose}
        ariaLabel="모달 닫기"
        className="h-[30px] w-[30px] shrink-0"
      />
    </header>
  );
}
