"use client";

import { Modal } from "@/components/common/Modal";
import { getSensitivity, setSensitivity, type Sensitivity } from "@/utils/sensitivity";
import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";

type SensitivitySettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// HTML home_final (17).html 기준: sens-dot-box 배경, sens-dot 색
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
      {/* modal-header — HTML과 동일: 흰 배경, 하단 보더 */}
      <div className="flex shrink-0 items-start justify-between border-b border-[#d4ead9] px-6 pt-[22px] pb-[18px]">
        <div>
          <h2
            className="mb-1.5 text-[17px] font-black leading-tight text-[#2d3b35]"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            민감도 설정
          </h2>
          <p className="text-xs text-[#7a9585]">거북목 감지 민감도를 조절해보세요</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-[#d4ead9] bg-[#f4faf6] text-xs text-[#7a9585] transition-colors hover:bg-[#e8f5ec]"
        >
          ✕
        </button>
      </div>

      {/* modal-body — sens-options만 (HTML에 현재 상태 칩 없음) */}
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
                  "flex cursor-pointer items-center justify-between rounded-[14px] px-4 py-3.5 transition-all duration-150",
                  isActive ? "bg-[#f4faf6]" : "bg-white hover:bg-[#f4faf6]"
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
                    isActive ? "border-[#4a7c59] bg-[#4a7c59]" : "border-[#d4ead9]"
                  )}
                >
                  {isActive && <span className="h-[7px] w-[7px] rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* modal-footer — HTML .btn-cancel / .btn-save */}
      <div className="flex shrink-0 gap-2.5 border-t border-[#d4ead9] px-6 py-3.5">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-[10px] border border-[#d4ead9] bg-[#f4faf6] px-3 py-2.5 text-[13px] font-semibold text-[#7a9585] transition-colors hover:bg-[#e8f5ec]"
        >
          닫기
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 rounded-[10px] border-none bg-[#4a7c59] px-3 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#3a6147]"
        >
          확인
        </button>
      </div>
    </Modal>
  );
}
