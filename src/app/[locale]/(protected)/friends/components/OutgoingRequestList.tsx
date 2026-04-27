"use client";

import { UserRow } from "@/app/[locale]/(protected)/friends/components/UserRow";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { SectionLabel } from "@/components/SectionLabel";
import type { FriendRequestRow } from "@/utils/types";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { tv } from "tailwind-variants";
import { getAvatarColor, getInitial } from "./friends.utils";

const cancelButton = tv({
  base: "rounded-[10px] border border-[#e4e4e4] bg-transparent px-3 py-1.5 whitespace-nowrap text-[14px] font-semibold text-[#bbb] transition-colors hover:border-[#ffb3a0] hover:bg-[#fff5f2] hover:text-[#ff8c6b]",
});

type OutgoingRequestListProps = {
  items: FriendRequestRow[];
  onCancel: (requestId: string, toUserId: string, toUserName: string | null) => void | Promise<void>;
};

export function OutgoingRequestList({ items, onCancel }: OutgoingRequestListProps) {
  const t = useTranslations("OutgoingRequestList");
  const pending = items.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-5">
      <SectionLabel>{t("SectionLabel")}</SectionLabel>
      {pending.length === 0 ? (
        <EmptyState icon={<span>📤</span>} message={t("EmptyState.message")} />
      ) : (
        <ul className="space-y-0">
          {pending.map((r) => (
            <li key={r.id}>
              <UserRow
                name={r.toUser.name ?? t("UserRow.name")}
                email={r.toUser.email ?? ""}
                initial={getInitial(r.toUser.name, r.toUser.id)}
                bgColor={getAvatarColor(r.toUser.id)}
                actions={
                  <>
                    <Chip>{t("Chip")}</Chip>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onCancel(r.id, r.toUser.id, r.toUser.name)}
                      className={cancelButton()}
                    >
                      {t("Button")}
                    </Button>
                  </>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
