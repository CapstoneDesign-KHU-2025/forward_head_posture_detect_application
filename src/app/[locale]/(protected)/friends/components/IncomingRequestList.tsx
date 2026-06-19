"use client";

import { UserRow } from "@/app/[locale]/(protected)/friends/components/UserRow";
import { EmptyState } from "@/components/EmptyState";
import { SectionLabel } from "@/components/SectionLabel";
import type { FriendRequestRow } from "@/utils/types";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { tv } from "tailwind-variants";
import { getAvatarColor, getInitial } from "./friends.utils";

const actionButton = tv({
  base: "rounded-[10px] whitespace-nowrap text-[14px] font-semibold transition-colors py-1.5",
  variants: {
    intent: {
      accept: "border-none bg-[#4a7c59] px-3.5 text-white hover:bg-[#3a6147]",
      decline: "border border-[#d4ead9] bg-transparent px-2.5 text-[#7a9585] hover:border-[#ff8c8c] hover:text-[#ff8c8c]",
    },
  },
});

type IncomingRequestListProps = {
  items: FriendRequestRow[];
  onAccept: (
    requestId: string,
    fromUser: { id: string; name: string | null; image: string | null },
  ) => void | Promise<void>;
  onDecline: (requestId: string, fromUserId: string) => void | Promise<void>;
};

export function IncomingRequestList({ items, onAccept, onDecline }: IncomingRequestListProps) {
  const t = useTranslations("IncomingRequestList");
  const pending = items.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-5">
      <SectionLabel>{t("SectionLabel")}</SectionLabel>
      {pending.length === 0 ? (
        <EmptyState icon={<span>📩</span>} message={t("EmptyState.message")} />
      ) : (
        <ul className="space-y-0">
          {pending.map((r) => (
            <li key={r.id}>
              <UserRow
                name={r.fromUser.name ?? t("UserRow.name")}
                email={r.fromUser.email ?? ""}
                initial={getInitial(r.fromUser.name, r.fromUser.id)}
                bgColor={getAvatarColor(r.fromUser.id)}
                actions={
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onAccept(r.id, r.fromUser)}
                      className={actionButton({ intent: "accept" })}
                    >
                      {t("Button.yes")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onDecline(r.id, r.fromUser.id)}
                      className={actionButton({ intent: "decline" })}
                    >
                      {t("Button.no")}
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
