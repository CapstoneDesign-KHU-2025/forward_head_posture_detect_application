"use client";

import { Search, Mail, Users } from "lucide-react";
import { cn } from "@/utils/cn";

type TabId = "search" | "requests" | "friends";

export type ModalTabBarProps = {
  activeTab: TabId;
  incomingCount: number;
  onTabChange: (tab: TabId) => void;
};

export function ModalTabBar({ activeTab, incomingCount, onTabChange }: ModalTabBarProps) {
  return (
    <div className="flex">
      <button
        type="button"
        onClick={() => onTabChange("search")}
        className={cn(
          "flex items-center gap-1.5 px-4 pb-2.5 pt-1.5 text-[13px] font-bold transition-colors",
          "relative cursor-pointer",
          activeTab === "search"
            ? "text-[#4a7c59]"
            : "text-[#aac8b2] hover:text-[#7a9585]"
        )}
      >
        {activeTab === "search" && (
          <span
            className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-sm bg-[#4a7c59]"
            aria-hidden
          />
        )}
        <Search size={12} strokeWidth={2.5} />
        검색
      </button>
      <button
        type="button"
        onClick={() => onTabChange("requests")}
        className={cn(
          "flex items-center gap-1.5 px-4 pb-2.5 pt-1.5 text-[13px] font-bold transition-colors",
          "relative cursor-pointer",
          activeTab === "requests"
            ? "text-[#4a7c59]"
            : "text-[#aac8b2] hover:text-[#7a9585]"
        )}
      >
        {activeTab === "requests" && (
          <span
            className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-sm bg-[#4a7c59]"
            aria-hidden
          />
        )}
        <Mail size={12} strokeWidth={2.5} />
        요청
        {incomingCount > 0 && (
          <span className="rounded-[10px] bg-[#ff8c6b] px-1.5 py-0.5 text-[10px] font-bold text-white">
            {incomingCount > 99 ? "99+" : incomingCount}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={() => onTabChange("friends")}
        className={cn(
          "flex items-center gap-1.5 px-4 pb-2.5 pt-1.5 text-[13px] font-bold transition-colors",
          "relative cursor-pointer",
          activeTab === "friends"
            ? "text-[#4a7c59]"
            : "text-[#aac8b2] hover:text-[#7a9585]"
        )}
      >
        {activeTab === "friends" && (
          <span
            className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-sm bg-[#4a7c59]"
            aria-hidden
          />
        )}
        <Users size={12} strokeWidth={2.5} />
        친구
      </button>
    </div>
  );
}
