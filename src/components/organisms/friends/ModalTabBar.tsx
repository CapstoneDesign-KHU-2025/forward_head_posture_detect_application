"use client";

import { TabButton } from "@/components/molecules/TabButton";
import { Search, Mail, Turtle } from "lucide-react";

type TabId = "search" | "requests" | "friends";

export type ModalTabBarProps = {
  activeTab: TabId;
  incomingCount: number;
  onTabChange: (tab: TabId) => void;
};

export function ModalTabBar({ activeTab, incomingCount, onTabChange }: ModalTabBarProps) {
  return (
    <div className="flex gap-1">
      <TabButton
        isActive={activeTab === "search"}
        onClick={() => onTabChange("search")}
      >
        <Search size={14} />
        검색
      </TabButton>
      <TabButton
        isActive={activeTab === "requests"}
        badgeCount={incomingCount}
        onClick={() => onTabChange("requests")}
      >
        <Mail size={14} />
        요청
      </TabButton>
      <TabButton
        isActive={activeTab === "friends"}
        onClick={() => onTabChange("friends")}
      >
        <Turtle size={14} />
        친구
      </TabButton>
    </div>
  );
}
