"use client";

import { Modal } from "@/components/atoms/Modal";
import { ModalHeader } from "@/components/atoms/ModalHeader";
import { Button } from "@/components/atoms/Button";
import { getSensitivity, setSensitivity, type Sensitivity } from "@/utils/sensitivity";
import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";

type SensitivitySettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SENS_OPTIONS: {
  id: Sensitivity;
  name: string;
  desc: string;
  dotBoxBg: string;
  dotColor: string;
}[] = [
  { id: "low", name: "낮음", desc: "자세가 많이 틀어졌을 때만 알림", dotBoxBg: "#e8f5ec", dotColor: "#4aab6a" },
  { id: "normal", name: "보통", desc: "적당한 수준에서 알림 (권장)", dotBoxBg: "#fef9e7", dotColor: "#f0c040" },
  { id: "high", name: "높음", desc: "자세가 조금만 틀어져도 바로 알림", dotBoxBg: "#fff2ef", dotColor: "#e05030" },
];

export default function SensitivitySettingsModal({ isOpen, onClose }: SensitivitySettingsModalProps) {
  const [selectedSensitivity, setSelectedSensitivity] = useState<Sensitivity>("normal");

  useEffect(() => {
    if (isOpen) {
      setSelectedSensitivity(getSensitivity());
    }
  }, [isOpen]);

  const handleConfirm = () => {
    setSensitivity(selectedSensitivity);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      contentClassName="w-full max-w-[420px] rounded-[22px] shadow-[0_20px_60px_rgba(45,59,53,0.18)]"
    >
      <ModalHeader
        title="민감도 설정"
        subtitle="거북목 감지 민감도를 조절해보세요"
        onClose={onClose}
      />

      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
        <div className="flex flex-col gap-[10px]">
          {SENS_OPTIONS.map((opt) => {
            const isActive = selectedSensitivity === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedSensitivity(opt.id)}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-[14px] border-[1.5px] px-4 py-3.5 transition-all duration-150",
                  isActive
                    ? "border-[#4a7c59] bg-[#f4faf6]"
                    : "border-[#d4ead9] bg-white hover:border-[#6aab7a] hover:bg-[#f4faf6]",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                    style={{ background: opt.dotBoxBg }}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: opt.dotColor }}
                    />
                  </div>
                  <div className="text-left">
                    <div className="mb-0.5 text-[14px] font-bold leading-tight text-[#7a9585]">
                      {opt.name}
                    </div>
                    <div className="text-xs text-[#7a9585]">{opt.desc}</div>
                  </div>
                </div>
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150",
                    isActive ? "border-[#4a7c59] bg-[#4a7c59]" : "border-[#d4ead9]",
                  )}
                >
                  {isActive && <span className="h-[7px] w-[7px] rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex shrink-0 gap-2.5 px-6 py-3.5">
        <Button
          type="button"
          variant="secondary"
          className="flex-1 text-[13px] py-2.5"
          onClick={onClose}
        >
          닫기
        </Button>
        <Button
          type="button"
          variant="primary"
          className="flex-1 text-[13px] py-2.5"
          onClick={handleConfirm}
        >
          확인
        </Button>
      </div>
    </Modal>
  );
}

