"use client";

import { Search, Mail, Users } from "lucide-react";
import { TabButton } from "@/app/[locale]/(protected)/friends/components/TabButton";
import { useTranslations } from "next-intl";
import { ModalTabBarProps } from "@/utils/types";

export function ModalTabBar({ activeTab, incomingCount, onTabChange }: ModalTabBarProps) {
  const t = useTranslations("ModalTabBar");
  return (
    <div className="flex gap-1">
      <TabButton isActive={activeTab === "search"} onClick={() => onTabChange("search")}>
        <Search size={12} strokeWidth={2.5} />
        {t("TabButton.search")}
      </TabButton>
      <TabButton isActive={activeTab === "requests"} onClick={() => onTabChange("requests")}>
        <Mail size={12} strokeWidth={2.5} />
        {t("TabButton.request")}
        {incomingCount > 0 && (
          <span className="rounded-[10px] bg-[#ff8c6b] px-1.5 py-0.5 text-[10px] font-bold text-white">
            {incomingCount > 99 ? "99+" : incomingCount}
          </span>
        )}
      </TabButton>
      <TabButton isActive={activeTab === "friends"} onClick={() => onTabChange("friends")}>
        <Users size={12} strokeWidth={2.5} />
        {t("TabButton.friend")}
      </TabButton>
    </div>
  );
}
