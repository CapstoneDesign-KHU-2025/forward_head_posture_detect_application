"use client";

import { Button } from "@/components/atoms/Button";
import { Modal } from "@/components/common/Modal";
import { getSensitivity, setSensitivity, getSensitivityLabel, type Sensitivity } from "@/utils/sensitivity";
import { useEffect, useState } from "react";

type SensitivitySettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SensitivitySettingsModal({ isOpen, onClose }: SensitivitySettingsModalProps) {
  const [currentSensitivity, setCurrentSensitivity] = useState<Sensitivity>("normal");
  const [selectedSensitivity, setSelectedSensitivity] = useState<Sensitivity>("normal"); // 임시 선택

  useEffect(() => {
    if (isOpen) {
      const saved = getSensitivity();
      setCurrentSensitivity(saved);
      setSelectedSensitivity(saved); // 모달 열 때 현재 민감도로 초기화
    }
  }, [isOpen]);

  // 민감도 선택 (임시로만 선택, 아직 저장 안 함)
  const handleSelect = (sensitivity: Sensitivity) => {
    setSelectedSensitivity(sensitivity);
  };

  // 확인 버튼 클릭 시 실제로 저장하고 모달 닫기
  const handleConfirm = () => {
    setSensitivity(selectedSensitivity);
    setCurrentSensitivity(selectedSensitivity);
    onClose(); // 모달 닫기
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">민감도 설정</h2>

        {/* 현재 민감도 상태 */}
        <div className="mb-6">
          <p className="text-sm text-black/60 mb-2">현재 민감도 상태</p>
          <div className="inline-flex items-center px-4 py-2 bg-black/5 rounded-md">
            <span className="font-semibold text-lg">{getSensitivityLabel(currentSensitivity)}</span>
          </div>
        </div>

        {/* 민감도 설정 버튼들 */}
        <div className="space-y-3 mb-6">
          <p className="text-sm text-black/60 mb-2">민감도 설정하기</p>
          <div className="flex flex-col gap-2">
            <Button
              variant={selectedSensitivity === "low" ? "primary" : "secondary"}
              onClick={() => handleSelect("low")}
              className="w-full"
            >
              낮음
            </Button>
            <Button
              variant={selectedSensitivity === "normal" ? "primary" : "secondary"}
              onClick={() => handleSelect("normal")}
              className="w-full"
            >
              보통
            </Button>
            <Button
              variant={selectedSensitivity === "high" ? "primary" : "secondary"}
              onClick={() => handleSelect("high")}
              className="w-full"
            >
              높음
            </Button>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            닫기
          </Button>
          <Button variant="primary" onClick={handleConfirm} className="flex-1">
            확인
          </Button>
        </div>
    </Modal>
  );
}
