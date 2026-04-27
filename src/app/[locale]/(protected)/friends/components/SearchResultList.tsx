"use client";

import { useState } from "react";
import { UserRow } from "@/app/[locale]/(protected)/friends/components/UserRow";
import { SearchInput } from "@/components/SearchInput";
import { EmptyState } from "@/components/EmptyState";
import { SectionLabel } from "@/components/SectionLabel";
import { SearchResultItem } from "@/utils/types";
import { Icon } from "@/components/Icon";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { tv } from "tailwind-variants";
const styles = {
  addButton: tv({
    base: "rounded-[10px] border-none bg-[var(--green)] px-3.5 py-1.5 whitespace-nowrap text-[14px] font-semibold text-white transition-colors hover:bg-[var(--green-dark)]",
  }),
  outgoingBadge: tv({
    base: "rounded-[10px] border border-[var(--green-pale)] bg-[#e8f5ec] px-3.5 py-1.5 whitespace-nowrap text-[14px] font-semibold text-[var(--green)]",
  }), 
}

const searchIcon = (
  <Icon size="lg">
    <Search className="text-[#7a9585]" />
  </Icon>
);

type SearchResultListProps = {
  searchResults: (query: string) => SearchResultItem[];
  onSendRequest: (user: SearchResultItem) => void | Promise<void>;
};

export function SearchResultList({ searchResults, onSendRequest }: SearchResultListProps) {
  const t = useTranslations("SearchResultList");
  const [query, setQuery] = useState("");
  const results = searchResults(query);
  const hasMinQuery = query.trim().length >= 2;

  return (
    <>
      <div className="shrink-0 bg-white px-6 pt-4">
        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-3">
        <SectionLabel>{t("SectionLabel")}</SectionLabel>
        {!hasMinQuery ? (
          <EmptyState icon={searchIcon} message={t("EmptyState.message_find_friends")} />
        ) : results.length === 0 ? (
          <EmptyState icon={searchIcon} message={t("EmptyState.message_no_result")} />
        ) : (
          <ul className="space-y-0">
            {results.map((u) => (
              <li key={u.id}>
                <UserRow
                  name={u.name ?? t("UserRow.name")}
                  email={u.email ?? ""}
                  initial={u.initial}
                  bgColor={u.color}
                  actions={
                    u.relation === "OUTGOING" ? (
                      <span className={styles.outgoingBadge()}>
                        {t("UserRow.actions_outgoing")}
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onSendRequest(u)}
                        className={styles.addButton()}
                      >
                        {t("UserRow.actions_adding")}
                      </Button>
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
