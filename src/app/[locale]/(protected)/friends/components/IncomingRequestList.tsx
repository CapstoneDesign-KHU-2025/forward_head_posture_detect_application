"use client";

import { UserRow } from "@/app/[locale]/(protected)/friends/components/UserRow";
import { EmptyState } from "@/components/EmptyState";
import { SectionLabel } from "@/components/SectionLabel";
import type { FriendRequestRow } from "@/utils/types";
import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";

const AVATAR_COLORS = ["#ff9f6b", "#6b9fff", "#ffc46b", "#b06bff", "#6aab7a", "#ff8c8c"];

function getAvatarStyle(id: string | null | undefined) {
  const safeId = (id ?? "").toString();
  if (!safeId.length) {
    return AVATAR_COLORS[0];
  }
  let hash = 0;
  for (let i = 0; i < safeId.length; i++) {
    hash = safeId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitial(name: string | null, id: string | null | undefined) {
  const base = (name && name.length > 0 ? name : (id ?? "")).toString();
  return base.charAt(0)?.toUpperCase() || "?";
}

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
                bgColor={getAvatarStyle(r.fromUser.id)}
                actions={
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onAccept(r.id, r.fromUser)}
                      className={cn(
                        "rounded-[10px] border-none bg-[#4a7c59] px-3.5 py-1.5",
                        "whitespace-nowrap text-[14px] font-semibold text-white",
                        "transition-colors hover:bg-[#3a6147]",
                      )}
                    >
                      {t("Button.yes")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onDecline(r.id, r.fromUser.id)}
                      className={cn(
                        "rounded-[10px] border border-[#d4ead9] bg-transparent px-2.5 py-1.5",
                        "whitespace-nowrap text-[14px] font-semibold text-[#7a9585]",
                        "transition-colors hover:border-[#ff8c8c] hover:text-[#ff8c8c]",
                      )}
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
