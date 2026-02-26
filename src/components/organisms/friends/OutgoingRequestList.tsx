"use client";

import { UserRow } from "@/components/molecules/UserRow";
import { Chip } from "@/components/atoms/Chip";
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

type OutgoingRequestListProps = {
  items: FriendRequestRow[];
  onCancel: (requestId: string, toUserId: string, toUserName: string | null) => void | Promise<void>;
};

export function OutgoingRequestList({ items, onCancel }: OutgoingRequestListProps) {
  const pending = items.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-5">
      <SectionLabel>보낸 요청</SectionLabel>
      {pending.length === 0 ? (
        <EmptyState
          icon={<span>📤</span>}
          message="보낸 요청이 없어요"
        />
      ) : (
        <div className="space-y-0">
          {pending.map((r) => (
            <UserRow
              key={r.id}
              name={r.toUser.name ?? "알 수 없음"}
              email={r.toUser.id}
              initial={getInitial(r.toUser.name, r.toUser.id)}
              bgColor={getAvatarStyle(r.toUser.id)}
              actions={
                <>
                  <Chip>대기 중</Chip>
                  <button
                    type="button"
                    onClick={() => onCancel(r.id, r.toUser.id, r.toUser.name)}
                    className={cn(
                      "rounded-[10px] border border-[#e4e4e4] bg-transparent px-3 py-1.5",
                      "whitespace-nowrap text-[14px] font-semibold text-[#bbb]",
                      "transition-colors hover:border-[#ffb3a0] hover:bg-[#fff5f2] hover:text-[#ff8c6b]"
                    )}
                  >
                    취소
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
