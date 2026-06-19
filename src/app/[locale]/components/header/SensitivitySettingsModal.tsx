"use client";

import { Modal } from "@/components/Modal";
import { ModalHeader } from "@/components/ModalHeader";
import { Button } from "@/components/Button";
import { SelectableOptionCard } from "@/components/SelectableOptionCard";
import { getSensitivity, setSensitivity } from "@/utils/sensitivity";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Sensitivity } from "@/utils/types";

type SensitivityOption = {
  id: Sensitivity;
  dotBoxBg: string;
  dotColor: string;
};

const SENSITIVITY_OPTIONS: SensitivityOption[] = [
  { id: "low",    dotBoxBg: "#e8f5ec", dotColor: "#4aab6a" },
  { id: "normal", dotBoxBg: "#fef9e7", dotColor: "#f0c040" },
  { id: "high",   dotBoxBg: "#fff2ef", dotColor: "#e05030" },
];

const styles = {
  modal:   "w-full max-w-[420px] rounded-[22px] shadow-[0_20px_60px_rgba(45,59,53,0.18)]",
  button:  "flex-1 text-[13px] py-2.5",
  dotBox:  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
  dot:     "inline-block h-2.5 w-2.5 rounded-full",
};

function SensitivityDotIcon({ dotBoxBg, dotColor }: Pick<SensitivityOption, "dotBoxBg" | "dotColor">) {
  return (
    <div className={styles.dotBox} style={{ background: dotBoxBg }}>
      <span className={styles.dot} style={{ background: dotColor }} />
    </div>
  );
}

type SensitivitySettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SensitivitySettingsModal({ isOpen, onClose }: SensitivitySettingsModalProps) {
  const [selectedSensitivity, setSelectedSensitivity] = useState<Sensitivity>("normal");
  const t = useTranslations("SensitivitySettingsModal");

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
    <Modal isOpen={isOpen} onClose={onClose} contentClassName={styles.modal}>
      <ModalHeader title={t("ModalHeader.title")} subtitle={t("ModalHeader.subtitle")} onClose={onClose} />

      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
        <div className="flex flex-col gap-2">
          {SENSITIVITY_OPTIONS.map((opt) => (
            <SelectableOptionCard
              key={opt.id}
              icon={<SensitivityDotIcon dotBoxBg={opt.dotBoxBg} dotColor={opt.dotColor} />}
              title={t(`sense_options.${opt.id}.name`)}
              description={t(`sense_options.${opt.id}.description`)}
              isSelected={selectedSensitivity === opt.id}
              onClick={() => setSelectedSensitivity(opt.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex shrink-0 gap-2.5 px-6 py-3.5">
        <Button type="button" variant="secondary" className={styles.button} onClick={onClose}>
          {t("button.close")}
        </Button>
        <Button type="button" variant="primary" className={styles.button} onClick={handleConfirm}>
          {t("button.confirm")}
        </Button>
      </div>
    </Modal>
  );
}
