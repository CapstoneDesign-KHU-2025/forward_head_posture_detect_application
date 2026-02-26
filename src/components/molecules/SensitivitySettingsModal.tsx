"use client";

import { SectionLabel } from "@/components/atoms/SectionLabel";
import { Button } from "@/components/atoms/Button";
import { Modal } from "@/components/atoms/Modal";
import { ModalHeader } from "@/components/atoms/ModalHeader";
import { getSensitivity, setSensitivity, getSensitivityLabel, type Sensitivity } from "@/utils/sensitivity";
import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";

type SensitivitySettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SENS_OPTIONS: { id: Sensitivity; emoji: string; name: string; desc: string; dotBg: string }[] = [
  { id: "low", emoji: "🟢", name: "낮음", desc: "자세가 많이 틀어졌을 때만 알림", dotBg: "#e8f5ec" },
  { id: "normal", emoji: "🟡", name: "보통", desc: "적당한 수준에서 알림 (권장)", dotBg: "#fff8e8" },
  { id: "high", emoji: "🔴", name: "높음", desc: "자세가 조금만 틀어져도 바로 알림", dotBg: "#fff0ee" },
];

function getSensEmoji(s: Sensitivity) {
  return SENS_OPTIONS.find((o) => o.id === s)?.emoji ?? "🟡";
}

export default function SensitivitySettingsModal({ isOpen, onClose }: SensitivitySettingsModalProps) {
  const [currentSensitivity, setCurrentSensitivity] = useState<Sensitivity>("normal");
  const [selectedSensitivity, setSelectedSensitivity] = useState<Sensitivity>("normal");

  useEffect(() => {
    if (isOpen) {
      const saved = getSensitivity();
      setCurrentSensitivity(saved);
      setSelectedSensitivity(saved);
    }
  }, [isOpen]);

  const handleSelect = (sensitivity: Sensitivity) => setSelectedSensitivity(sensitivity);

  const handleConfirm = () => {
    setSensitivity(selectedSensitivity);
    setCurrentSensitivity(selectedSensitivity);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-[440px] w-full">
      <ModalHeader
        title="민감도 설정"
        subtitle="거북목 감지 민감도를 조절해보세요"
        onClose={onClose}
      />
      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-[22px]">
        <div className="mb-5">
          <SectionLabel>현재 민감도 상태</SectionLabel>
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-[#d4ead9] bg-[#f4faf6] px-3.5 py-1.5">
            <span className="text-[14px] font-semibold text-[#4a7c59]">
              {getSensEmoji(currentSensitivity)} {getSensitivityLabel(currentSensitivity)}
            </span>
          </div>
        </div>

        <div className="mb-5">
          <SectionLabel>민감도 설정하기</SectionLabel>
          <div className="flex flex-col gap-2">
            {SENS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={cn(
                  "flex items-center gap-3.5 rounded-[14px] border-[1.5px] bg-white px-4 py-3.5 transition-all duration-[180ms]",
                  "hover:border-[#6aab7a] hover:bg-[#f9fdf9]",
                  selectedSensitivity === opt.id
                    ? "border-[#4a7c59] bg-[#f0f9f3] shadow-[0_2px_10px_rgba(74,124,89,0.12)]"
                    : "border-[#e4f0e8]"
                )}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-lg"
                  style={{ background: opt.dotBg }}
                >
                  {opt.emoji}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-base font-semibold text-[#2d3b35]">{opt.name}</div>
                  <div className="text-sm text-[#7a9585]">{opt.desc}</div>
                </div>
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-[180ms]",
                    selectedSensitivity === opt.id
                      ? "border-[#4a7c59] bg-[#4a7c59]"
                      : "border-[#d4ead9]"
                  )}
                >
                  {selectedSensitivity === opt.id && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 gap-2.5 px-6 pb-[22px]">
        <Button
          type="button"
          variant="secondary"
          className="flex-1 text-[14px] py-3"
          onClick={onClose}
        >
          닫기
        </Button>
        <Button
          type="button"
          variant="primary"
          className="flex-1 text-[14px] py-3"
          onClick={handleConfirm}
        >
          확인
        </Button>
      </div>
    </Modal>
  );
}
