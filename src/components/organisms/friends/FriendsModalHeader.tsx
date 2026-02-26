"use client";

import { Users } from "lucide-react";
import { ModalTabBar } from "./ModalTabBar";
import type { ModalTabBarProps } from "./ModalTabBar";
import { IconButton } from "@/components/atoms/IconButton";

type TabId = "search" | "requests" | "friends";

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
    <div
      className="flex shrink-0 flex-col bg-gradient-to-br from-[#4a7c59] to-[#6aab7a] px-6 pt-5"
      style={{ background: "linear-gradient(135deg, #4a7c59 0%, #6aab7a 100%)" }}
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-extrabold text-[20px] text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
            <Users size={22} className="text-white" strokeWidth={2} />
            친구 관리
          </h2>
          <p className="mt-0.5 text-[14px] text-white/75">친구와 함께 거북목 탈출!</p>
        </div>
        <IconButton
          variant="outline"
          icon={<span className="leading-none text-[20px]">×</span>}
          onClick={onClose}
          aria-label="친구 모달 닫기"
        />
      </div>
      <ModalTabBar
        activeTab={activeTab}
        incomingCount={incomingCount}
        onTabChange={onTabChange}
      />
    </div>
  );
}
