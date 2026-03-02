"use client";

import { Search, Mail, Users } from "lucide-react";
import { TabButton } from "@/components/atoms/TabButton";

type TabId = "search" | "requests" | "friends";

export type ModalTabBarProps = {
  activeTab: TabId;
  incomingCount: number;
  onTabChange: (tab: TabId) => void;
};

export function ModalTabBar({ activeTab, incomingCount, onTabChange }: ModalTabBarProps) {
  return (
    <div className="flex gap-1">
      <TabButton isActive={activeTab === "search"} onClick={() => onTabChange("search")}>
        <Search size={12} strokeWidth={2.5} />
        검색
      </TabButton>
      <TabButton isActive={activeTab === "requests"} onClick={() => onTabChange("requests")}>
        <Mail size={12} strokeWidth={2.5} />
        요청
        {incomingCount > 0 && (
          <span className="rounded-[10px] bg-[#ff8c6b] px-1.5 py-0.5 text-[10px] font-bold text-white">
            {incomingCount > 99 ? "99+" : incomingCount}
          </span>
        )}
      </TabButton>
      <TabButton isActive={activeTab === "friends"} onClick={() => onTabChange("friends")}>
        <Users size={12} strokeWidth={2.5} />
        친구
      </TabButton>
    </div>
  );
}
