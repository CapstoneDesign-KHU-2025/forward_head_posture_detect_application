"use client";

import Image from "next/image";
import { Modal } from "@/components/atoms/Modal";
import { ModalHeader } from "@/components/atoms/ModalHeader";
import { Button } from "@/components/atoms/Button";
import { SelectableOptionCard } from "@/components/molecules/SelectableOptionCard";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type CharacterSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function getSelectedCharacter(): string {
  if (typeof window === "undefined") return "remy";
  const selected = localStorage.getItem("selectedCharacter");
  return selected || "remy";
}

export default function CharacterSelectionModal({ isOpen, onClose }: CharacterSelectionModalProps) {
  const t_char = useTranslations("Characters");
  const t = useTranslations("CharacterSelectionModal");
  const characters = [
    {
      id: "remy",
      icon: "/icons/remy.png",
      name: t_char("remy.name"),
      description: t_char("remy.description"),
    },
    {
      id: "jerry",
      icon: "/icons/cat.png",
      name: t_char("jerry.name"),
      description: t_char("jerry.description"),
    },
    {
      id: "jessica",
      icon: "/icons/girl.png",
      name: t_char("jessica.name"),
      description: t_char("jessica.description"),
    },
  ];

  const [selectedCharacter, setSelectedCharacter] = useState<string>("remy");

  useEffect(() => {
    if (!isOpen) return;
    const saved = getSelectedCharacter();
    setSelectedCharacter(saved);
  }, [isOpen]);

  const handleSelect = (characterId: string) => setSelectedCharacter(characterId);

  const handleConfirm = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCharacter", selectedCharacter);
      window.dispatchEvent(new Event("storage"));
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      contentClassName="w-full max-w-[420px] rounded-[22px] shadow-[0_20px_60px_rgba(45,59,53,0.18)]"
    >
      <ModalHeader title={t("ModalHeader.title")} subtitle={t("ModalHeader.subtitle")} onClose={onClose} />

      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-[22px]">
        <div className="flex flex-col gap-2">
          {characters.map((character) => (
            <SelectableOptionCard
              key={character.id}
              icon={
                <div className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e8f5ec]">
                  <Image src={character.icon} alt={character.name} width={52} height={52} className="object-cover" />
                </div>
              }
              title={character.name}
              description={character.description}
              isSelected={selectedCharacter === character.id}
              onClick={() => handleSelect(character.id)}
            />
          ))}
        </div>
      </div>
      <div className="flex shrink-0 gap-2.5 px-6 py-3.5">
        <Button type="button" variant="secondary" className="flex-1 text-[14px] font-semibold py-3" onClick={onClose}>
          {t("button.close")}
        </Button>
        <Button type="button" variant="primary" className="flex-1 text-[14px] py-3" onClick={handleConfirm}>
          {t("button.confirm")}
        </Button>
      </div>
    </Modal>
  );
}
