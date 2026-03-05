"use client";

import { Modal } from "@/components/atoms/Modal";
import { ModalHeader } from "@/components/atoms/ModalHeader";
import { Button } from "@/components/atoms/Button";
import { SelectableOptionCard } from "@/components/molecules/SelectableOptionCard";
import { getSensitivity, setSensitivity, type Sensitivity } from "@/utils/sensitivity";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
type SensitivitySettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SensitivitySettingsModal({ isOpen, onClose }: SensitivitySettingsModalProps) {
  const [selectedSensitivity, setSelectedSensitivity] = useState<Sensitivity>("normal");
  const t = useTranslations("SensitivitySettingsModal");

  const SENS_OPTIONS: {
    id: Sensitivity;
    name: string;
    desc: string;
    dotBoxBg: string;
    dotColor: string;
  }[] = [
    {
      id: "low",
      name: t("sense_options.low.name"),
      desc: t("sense_options.low.description"),
      dotBoxBg: "#e8f5ec",
      dotColor: "#4aab6a",
    },
    {
      id: "normal",
      name: t("sense_options.normal.name"),
      desc: t("sense_options.normal.description"),
      dotBoxBg: "#fef9e7",
      dotColor: "#f0c040",
    },
    {
      id: "high",
      name: t("sense_options.high.name"),
      desc: t("sense_options.high.description"),
      dotBoxBg: "#fff2ef",
      dotColor: "#e05030",
    },
  ];

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
      <ModalHeader title={t("ModalHeader.title")} subtitle={t("ModalHeader.subtitle")} onClose={onClose} />

      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
        <div className="flex flex-col gap-2">
          {SENS_OPTIONS.map((opt) => (
            <SelectableOptionCard
              key={opt.id}
              icon={
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                  style={{ background: opt.dotBoxBg }}
                >
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: opt.dotColor }} />
                </div>
              }
              title={opt.name}
              description={opt.desc}
              isSelected={selectedSensitivity === opt.id}
              onClick={() => setSelectedSensitivity(opt.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex shrink-0 gap-2.5 px-6 py-3.5">
        <Button type="button" variant="secondary" className="flex-1 text-[13px] py-2.5" onClick={onClose}>
          {t("button.close")}
        </Button>
        <Button type="button" variant="primary" className="flex-1 text-[13px] py-2.5" onClick={handleConfirm}>
          {t("button.confirm")}
        </Button>
      </div>
    </Modal>
  );
}
