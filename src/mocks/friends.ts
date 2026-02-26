import type { Friend, FriendRequestRow, SearchUser } from "@/types/friends";

// 친구 목록
export const MOCK_FRIENDS: Friend[] = [
  {
    friendshipId: "fr-jisu",
    user: { id: "jisu@gmail.com", name: "박지수", image: null },
  },
  {
    friendshipId: "fr-minjun",
    user: { id: "minjun@gmail.com", name: "최민준", image: null },
  },
];

// 받은 요청 (PENDING)
export const MOCK_INCOMING: FriendRequestRow[] = [
  {
    id: "req-1",
    status: "PENDING",
    fromUser: { id: "haneul@gmail.com", name: "김하늘", image: null },
    toUser: { id: "me", name: "Jimin Nam", image: null },
  },
  {
    id: "req-2",
    status: "PENDING",
    fromUser: { id: "junho@gmail.com", name: "이준호", image: null },
    toUser: { id: "me", name: "Jimin Nam", image: null },
  },
];

// 보낸 요청 (PENDING)
export const MOCK_OUTGOING: FriendRequestRow[] = [
  {
    id: "out-1",
    status: "PENDING",
    fromUser: { id: "me", name: "Jimin Nam", image: null },
    toUser: { id: "yoo@kakao.com", name: "유재석", image: null },
  },
];

// 검색용 사용자 풀 (이메일/이름으로 검색 시 매칭)
export const MOCK_SEARCH_POOL: (SearchUser & { initial?: string; color?: string })[] = [
  { id: "hong@gmail.com", name: "홍길동", image: null, initial: "H", color: "#ff9f6b" },
  { id: "jjangu@naver.com", name: "신짱구", image: null, initial: "S", color: "#6b9fff" },
  { id: "yoo@kakao.com", name: "유재석", image: null, initial: "Y", color: "#ffc46b" },
  { id: "minsu@gmail.com", name: "김민수", image: null, initial: "K", color: "#b06bff" },
  { id: "sujin@naver.com", name: "이수진", image: null, initial: "L", color: "#6aab7a" },
  { id: "seojun@kakao.com", name: "박서준", image: null, initial: "P", color: "#ff8c8c" },
  { id: "haneul@gmail.com", name: "김하늘", image: null, initial: "K", color: "#ff9f6b" },
  { id: "junho@gmail.com", name: "이준호", image: null, initial: "L", color: "#6b9fff" },
  { id: "jisu@gmail.com", name: "박지수", image: null, initial: "P", color: "#b06bff" },
  { id: "minjun@gmail.com", name: "최민준", image: null, initial: "C", color: "#6aab7a" },
];

// 이메일별 관계 상태 (FRIEND, INCOMING → 검색 결과에서 제외 / OUTGOING → "✓ 요청됨" / NONE → "+ 추가")
export const MOCK_RELATION: Record<string, "NONE" | "OUTGOING" | "INCOMING" | "FRIEND"> = {
  "hong@gmail.com": "NONE",
  "jjangu@naver.com": "OUTGOING",
  "yoo@kakao.com": "OUTGOING",
  "minsu@gmail.com": "INCOMING",
  "sujin@naver.com": "FRIEND",
  "seojun@kakao.com": "NONE",
  "haneul@gmail.com": "INCOMING",
  "junho@gmail.com": "INCOMING",
  "jisu@gmail.com": "FRIEND",
  "minjun@gmail.com": "FRIEND",
};
