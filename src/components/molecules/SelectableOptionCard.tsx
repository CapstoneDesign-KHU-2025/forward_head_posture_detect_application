"use client";

import { cn } from "@/utils/cn";

type SelectableOptionCardProps = {
  /** 왼쪽 아이콘/이미지 영역 */
  icon: React.ReactNode;
  /** 제목 */
  title: string;
  /** 설명 */
  description: string;
  /** 선택 여부 */
  isSelected: boolean;
  /** 클릭 시 */
  onClick: () => void;
  /** 카드 추가 스타일 (선택 시 shadow 등) */
  className?: string;
};

export function SelectableOptionCard({
  icon,
  title,
  description,
  isSelected,
  onClick,
  className,
}: SelectableOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-2xl border-[1.5px] px-4 py-3 transition-all duration-150",
        "hover:border-[#6aab7a] hover:bg-[var(--green-pale)]",
        isSelected
          ? "border-[#4a7c59] bg-[var(--green-pale)] shadow-[0_2px_10px_rgba(74,124,89,0.12)]"
          : "border-[#d4ead9] bg-white",
        className
      )}
    >
      <div className="flex flex-1 items-center gap-3.5 text-left">
        {icon}
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 font-semibold leading-tight text-[#2d3b35]">{title}</div>
          <div className="text-sm leading-relaxed text-[#7a9585]">{description}</div>
        </div>
      </div>
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150",
          isSelected ? "border-[#4a7c59] bg-[#4a7c59]" : "border-[#d4ead9]"
        )}
      >
        {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}
