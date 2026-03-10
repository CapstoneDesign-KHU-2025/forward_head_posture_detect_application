"use client";

import { UserRow } from "@/components/molecules/UserRow";
import { Chip } from "@/components/atoms/Chip";
import { EmptyState } from "@/components/atoms/EmptyState";
import { SectionLabel } from "@/components/atoms/SectionLabel";
import type { FriendRequestRow } from "@/types/friends";
import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";
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
  const base = (name && name.length > 0 ? name : id ?? "").toString();
  return base.charAt(0)?.toUpperCase() || "?";
}

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
        <div className="space-y-0">
          {pending.map((r) => (
            <UserRow
              key={r.id}
              name={r.toUser.name ?? t("UserRow.name")}
              email={r.toUser.email ?? ""}
              initial={getInitial(r.toUser.name, r.toUser.id)}
              bgColor={getAvatarStyle(r.toUser.id)}
              actions={
                <>
                  <Chip>{t("Chip")}</Chip>
                  <button
                    type="button"
                    onClick={() => onCancel(r.id, r.toUser.id, r.toUser.name)}
                    className={cn(
                      "rounded-[10px] border border-[#e4e4e4] bg-transparent px-3 py-1.5",
                      "whitespace-nowrap text-[14px] font-semibold text-[#bbb]",
                      "transition-colors hover:border-[#ffb3a0] hover:bg-[#fff5f2] hover:text-[#ff8c6b]",
                    )}
                  >
                    {t("Button")}
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
