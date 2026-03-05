"use client";

import { Card } from "@/components/atoms/Card";
import { cn } from "@/utils/cn";
import LoadingSkeleton from "@/components/molecules/LoadingSkeleton";
import { SegmentToggle } from "@/components/molecules/SegmentToggle";
import type { PoseMode } from "@/components/molecules/3DModel";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const ThreeDModel = dynamic(() => import("@/components/molecules/3DModel"), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});

type ChallengePanelProps = {
  userAng: number | undefined;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
};

const idealAng = 52;

function getSelectedCharacter(): string {
  if (typeof window === "undefined") return "remy";
  const selected = localStorage.getItem("selectedCharacter");
  return selected || "remy";
}

export default function Posture3DCard({
  userAng,
  title = "당신의 거북목 도전기",
  description,
  className,
}: ChallengePanelProps) {
  const t = useTranslations("Posture3DCard");
  const [characterId, setCharacterId] = useState<string>("remy");
  const [poseMode, setPoseMode] = useState<PoseMode>("upper");

  useEffect(() => {
    setCharacterId(getSelectedCharacter());

    // localStorage 변경 감지 (다른 탭이나 페이지에서 변경된 경우)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedCharacter" && e.newValue) {
        setCharacterId(e.newValue);
      }
    };

    // 커스텀 이벤트 감지 (같은 탭에서 캐릭터 변경된 경우)
    const handleCustomStorage = () => {
      setCharacterId(getSelectedCharacter());
    };

    // 페이지 포커스 시 다시 확인 (같은 탭에서 캐릭터 변경 후 돌아온 경우)
    const handleFocus = () => {
      setCharacterId(getSelectedCharacter());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("storage", handleCustomStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storage", handleCustomStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const currentAngle = userAng ?? idealAng;
  const delta = currentAngle - idealAng;
  const deltaLabel = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}°`;

  let statusText = t("statusText.good");
  if (Math.abs(delta) > 5) {
    statusText = t("statusText.bad");
  } else if (Math.abs(delta) > 2) {
    statusText = t("statusText.middle");
  }

  return (
    <Card className={cn("p-6 pt-4 flex flex-col gap-4 overflow-hidden h-full w-full", className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-extrabold text-[var(--text)]" style={{ fontFamily: "Nunito, sans-serif" }}>
            {title}
          </h2>
          <p className="mt-[2px] text-[12px] font-semibold text-[var(--text-muted)]">{t("fivemins_average")}</p>
        </div>
        <div
          className="bg-[var(--green-light)] rounded-full px-4 py-[4px] text-[15px] font-extrabold text-[var(--green)]"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          {currentAngle.toFixed(1)}°
        </div>
      </div>

      {/* 3D 모델 영역 */}
      <div className="flex-1 min-h-[260px] flex flex-col relative">
        <div className="w-full h-full min-h-[200px] rounded-[22px] bg-[linear-gradient(180deg,#e8f5ec_0%,var(--green-pale)_70%,#e0f0e5_100%)] flex items-center justify-center relative overflow-hidden">
          {/* 바닥 그라디언트 느낌 */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(0deg,rgba(74,124,89,0.12)_0%,transparent_100%)]" />

          <div className="relative z-[1] w-full h-full">
            <ThreeDModel characterId={characterId} idealAng={idealAng} userAng={currentAngle} poseMode={poseMode} />
            <div className="absolute bottom-3 right-3 z-10">
              <SegmentToggle
                options={[
                  { value: "upper" as const, label: "Upper body" },
                  { value: "stand" as const, label: "Full body" },
                ]}
                value={poseMode}
                onChange={(v) => setPoseMode(v)}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
