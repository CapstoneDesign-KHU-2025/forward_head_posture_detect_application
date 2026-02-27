"use client";

import { Users } from "lucide-react";
import { ModalTabBar } from "./ModalTabBar";
import type { ModalTabBarProps } from "./ModalTabBar";
import { cn } from "@/utils/cn";

type FriendsModalHeaderProps = ModalTabBarProps & {
  onClose: () => void;
};

export function FriendsModalHeader({
  activeTab,
  incomingCount,
  onTabChange,
  onClose,
}: FriendsModalHeaderProps) {
  return (
    <div className="relative flex shrink-0 flex-col border-b border-[#d4ead9] bg-white px-6 pt-[22px]">
      <button
        type="button"
        onClick={onClose}
        className={cn(
          "absolute right-6 top-[18px] flex h-[30px] w-[30px] items-center justify-center rounded-lg",
          "border border-[#d4ead9] bg-[#f4faf6] text-[12px] text-[#7a9585] transition-colors hover:bg-[#e8f5ec]"
        )}
        aria-label="친구 모달 닫기"
      >
        ✕
      </button>
      <div className="mb-1 flex items-center gap-2.5">
        <Users size={18} className="text-[#4a7c59]" strokeWidth={2.2} />
        <h2
          className="font-black text-[#2d3b35]"
          style={{ fontFamily: "Nunito, sans-serif", fontSize: "19px" }}
        >
          친구 관리
        </h2>
      </div>
      <p className="mb-3.5 text-[12px] text-[#aac8b2]">친구와 함께 거북목 탈출!</p>
      <ModalTabBar
        activeTab={activeTab}
        incomingCount={incomingCount}
        onTabChange={onTabChange}
      />
    </div>
  );
}
