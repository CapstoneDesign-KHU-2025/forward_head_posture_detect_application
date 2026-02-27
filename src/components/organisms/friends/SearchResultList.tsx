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

type SearchResultListProps = {
  searchResults: (query: string) => SearchResultItem[];
  onSendRequest: (user: SearchResultItem) => void | Promise<void>;
};

export function SearchResultList({ searchResults, onSendRequest }: SearchResultListProps) {
  const [query, setQuery] = useState("");
  const results = searchResults(query);

  return (
    <>
      <div className="shrink-0 bg-white px-6 pt-4">
        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-3">
        <SectionLabel>검색 결과</SectionLabel>
        {query.trim().length < 2 ? (
          <EmptyState
            icon={
              <Icon size="lg">
                <Search className="text-[#7a9585]" />
              </Icon>
            }
            message="이메일을 입력해서 친구를 찾아보세요"
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon={
              <Icon size="lg">
                <Search className="text-[#7a9585]" />
              </Icon>
            }
            message="일치하는 사용자를 찾을 수 없어요"
          />
        ) : (
          <div className="space-y-0">
            {results.map((u) => (
              <UserRow
                key={u.id}
                name={u.name ?? "알 수 없음"}
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
                      ✓ 요청됨
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
                      + 추가
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
