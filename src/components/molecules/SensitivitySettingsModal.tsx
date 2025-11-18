"use client";

import * as React from "react";
import { Button } from "@/components/atoms/button/Button";
import { getSensitivity, setSensitivity, getSensitivityLabel, type Sensitivity } from "@/utils/sensitivity";

type SensitivitySettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SensitivitySettingsModal({ isOpen, onClose }: SensitivitySettingsModalProps) {
  const [currentSensitivity, setCurrentSensitivity] = React.useState<Sensitivity>("normal");
  const [showSuccess, setShowSuccess] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentSensitivity(getSensitivity());
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleSave = (sensitivity: Sensitivity) => {
    setSensitivity(sensitivity);
    setCurrentSensitivity(sensitivity);
    setShowSuccess(true);
    
    // 2초 후 성공 메시지 숨기기
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
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
              variant={currentSensitivity === "low" ? "primary" : "secondary"}
              onClick={() => handleSave("low")}
              className="w-full"
            >
              낮음
            </Button>
            <Button
              variant={currentSensitivity === "normal" ? "primary" : "secondary"}
              onClick={() => handleSave("normal")}
              className="w-full"
            >
              보통
            </Button>
            <Button
              variant={currentSensitivity === "high" ? "primary" : "secondary"}
              onClick={() => handleSave("high")}
              className="w-full"
            >
              높음
            </Button>
          </div>
        </div>

        {/* 성공 메시지 */}
        {showSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm font-medium">
              ✓ 민감도가 {getSensitivityLabel(currentSensitivity)}(으)로 설정되었습니다.
            </p>
          </div>
        )}

        {/* 닫기 버튼 */}
        <Button variant="secondary" onClick={onClose} className="w-full">
          닫기
        </Button>
      </div>
    </div>
  );
}

