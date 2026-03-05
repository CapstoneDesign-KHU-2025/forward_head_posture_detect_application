"use client";

import { useState } from "react";
import { UserRow } from "@/components/molecules/UserRow";
import { SearchInput } from "@/components/molecules/SearchInput";
import { EmptyState } from "@/components/atoms/EmptyState";
import { SectionLabel } from "@/components/atoms/SectionLabel";
import type { SearchResultItem } from "@/hooks/useFriendsData";
import { Icon } from "@/components/atoms/Icon";
import { Search } from "lucide-react";
import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";

type SearchResultListProps = {
  searchResults: (query: string) => SearchResultItem[];
  onSendRequest: (user: SearchResultItem) => void | Promise<void>;
};

export function SearchResultList({ searchResults, onSendRequest }: SearchResultListProps) {
  const t = useTranslations("SearchResultList");

  const [query, setQuery] = useState("");
  const results = searchResults(query);

  return (
    <>
      <div className="shrink-0 bg-white px-6 pt-4">
        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-3">
        <SectionLabel>{t("SectionLabel")}</SectionLabel>
        {query.trim().length < 2 ? (
          <EmptyState
            icon={
              <Icon size="lg">
                <Search className="text-[#7a9585]" />
              </Icon>
            }
            message={t("EmptyState.message_find_friends")}
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon={
              <Icon size="lg">
                <Search className="text-[#7a9585]" />
              </Icon>
            }
            message={t("EmptyState.message_no_result")}
          />
        ) : (
          <div className="space-y-0">
            {results.map((u) => (
              <UserRow
                key={u.id}
                name={u.name ?? t("UserRow.name")}
                email={u.email ?? ""}
                initial={u.initial}
                bgColor={u.color}
                actions={
                  u.relation === "OUTGOING" ? (
                    <span
                      className={cn(
                        "rounded-[10px] border border-[#c2dfc9] bg-[#e8f5ec px-3.5 py-1.5",
                        "whitespace-nowrap text-[14px] font-semibold text-[#4a7c59]",
                      )}
                    >
                      {t("UserRow.actions_outgoing")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSendRequest(u)}
                      className={cn(
                        "rounded-[10px] border-none bg-[#4a7c59] px-3.5 py-1.5",
                        "whitespace-nowrap text-[14px] font-semibold text-white",
                        "transition-colors hover:bg-[#3a6147]",
                      )}
                    >
                      {t("UserRow.actions_adding")}
                    </button>
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
