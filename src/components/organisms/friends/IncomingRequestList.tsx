"use client";

import { UserRow } from "@/components/molecules/UserRow";
import { EmptyState } from "@/components/atoms/EmptyState";
import { SectionLabel } from "@/components/atoms/SectionLabel";
import type { FriendRequestRow } from "@/types/friends";
import { cn } from "@/utils/cn";

const AVATAR_COLORS = ["#ff9f6b", "#6b9fff", "#ffc46b", "#b06bff", "#6aab7a", "#ff8c8c"];

function getAvatarStyle(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitial(name: string | null, id: string) {
  return name?.charAt(0)?.toUpperCase() ?? id?.charAt(0)?.toUpperCase() ?? "?";
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
  const pending = items.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-5">
      <SectionLabel>받은 요청</SectionLabel>
      {pending.length === 0 ? (
        <EmptyState icon={<span>📩</span>} message="받은 요청이 없어요" />
      ) : (
        <ul className="space-y-0">
          {pending.map((r) => (
            <li key={r.id}>
              <UserRow
                name={r.fromUser.name ?? "알 수 없음"}
                email={r.fromUser.id}
                initial={getInitial(r.fromUser.name, r.fromUser.id)}
                bgColor={getAvatarStyle(r.fromUser.id)}
                actions={
                  <>
                    <button
                      type="button"
                      onClick={() => onAccept(r.id, r.fromUser)}
                      className={cn(
                        "rounded-[10px] border-none bg-[#4a7c59] px-3.5 py-1.5",
                        "whitespace-nowrap text-[14px] font-semibold text-white",
                        "transition-colors hover:bg-[#3a6147]",
                      )}
                    >
                      수락
                    </button>
                    <button
                      type="button"
                      onClick={() => onDecline(r.id, r.fromUser.id)}
                      className={cn(
                        "rounded-[10px] border border-[#d4ead9] bg-transparent px-2.5 py-1.5",
                        "whitespace-nowrap text-[14px] font-semibold text-[#7a9585]",
                        "transition-colors hover:border-[#ff8c8c] hover:text-[#ff8c8c]",
                      )}
                    >
                      거절
                    </button>
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
