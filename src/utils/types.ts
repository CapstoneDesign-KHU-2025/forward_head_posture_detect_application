export type GuideColor = "green" | "red" | "orange";
export type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};
export type StatusPillVariant = "idle" | "guide" | "warn" | "count" | "good" | "bad" | "stopped";

export type ModalTabBarProps = {
  activeTab: TabId;
  incomingCount: number;
  onTabChange: (tab: TabId) => void;
};
export type TabId = "search" | "requests" | "friends";
export type DayStatus = "good" | "bad";

type WeeklySummaryRow = {
  id: number;
  userId: string;
  avgAngle: number;
  sumWeighted: number;
  weightSeconds: number;
  count: number;
  date: string | Date;
  goodDay: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};
export type WeeklySummaryData = {
  mode: "weekly" | "dynamic";
  requestedDays: number;
  actualDataDays: number;
  weightedAvg: number | null;
  safeRows: WeeklySummaryRow[];
  goodDays: number;
};
export type UserProfile = {
  id: string;
  name: string;
  image?: string;
};
export type KPIItem = {
  label: string;
  value: number | string;
  unit?: string;
  delta?: "up" | "down";
  deltaText?: string;
  deltaVariant?: "neutral" | "success" | "warning" | "danger";
  caption?: string;
};
export type PoseMode = "stand" | "upper";

export type TestInfo = {
  monitorDistance: number;
  monitorHight: number;
  angleBetweenBodyAndCam: number;
  isHairTied: boolean;
  turtleNeckLevel: "none" | "mild" | "severe";
};
export type SearchResultItem = {
  id: string;
  name: string | null;
  image: string | null;
  email?: string | null;
  initial: string;
  color: string;
  relation: RelationStatus | "NONE";
};
export type RelationStatus = "NONE" | "OUTGOING" | "INCOMING" | "FRIEND";
export type StatusBannerType = "success" | "warning" | "info";
export type PostureMeasurement = {
  userId: string;
  ts: number;
  angleDeg: number;
  isTurtle: boolean;
  hasPose: boolean;
  sessionId?: string;
  sampleGapS?: number;
};
export type ActionState<T = undefined> = {
  ok: boolean;
  message?: { ko: string; en: string };
  status?: number;
  data?: T;
} | null;

type UserInfo = {
  id: string;
  name: string | null;
  image: string | null;
  email?: string | null;
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
type PosePoint = { x: number; y: number; z: number };
export type Pose = PosePoint[];
export type Point3D = { x: number; y: number; z: number };

export type Sensitivity = "low" | "normal" | "high";
export type isTurtleNeckProp = {
  earLeft: Point3D;
  earRight: Point3D;
  shoulderLeft: Point3D;
  shoulderRight: Point3D;
  sensitivity?: Sensitivity;
};
