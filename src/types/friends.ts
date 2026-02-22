// 백엔드 API 응답 타입 (나중에 API 연동 시 동일하게 사용)

export type UserInfo = {
  id: string;
  name: string | null;
  image: string | null;
};

export type Friend = {
  friendshipId: string;
  user: UserInfo;
};

export type FriendRequestRow = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED";
  fromUser: UserInfo;
  toUser: UserInfo;
};

export type SearchUser = UserInfo;

// 검색 결과에서의 관계 상태 (클라이언트 전용)
export type RelationStatus = "NONE" | "OUTGOING" | "INCOMING" | "FRIEND";
