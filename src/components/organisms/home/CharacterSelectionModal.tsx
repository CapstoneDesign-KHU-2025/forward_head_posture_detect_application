"use client";

import { Modal } from "@/components/atoms/Modal";
import { ModalHeader } from "@/components/atoms/ModalHeader";
import { Button } from "@/components/atoms/Button";
import { SelectableOptionCard } from "@/components/molecules/SelectableOptionCard";
import { useEffect, useState } from "react";

type CharacterSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const characters = [
  {
    id: "remy",
    icon: "/icons/remy.png",
    name: "래미",
    description: "부드럽고 따뜻한 친근한 캐릭터",
  },
  {
    id: "jerry",
    icon: "/icons/cat.png",
    name: "제리",
    description: "활발하고 귀여운 사랑스러운 캐릭터",
  },
  {
    id: "jessica",
    icon: "/icons/girl.png",
    name: "제시카",
    description: "우아하고 세련된 멋진 캐릭터",
  },
];

function getSelectedCharacter(): string {
  if (typeof window === "undefined") return "remy";
  const selected = localStorage.getItem("selectedCharacter");
  return selected || "remy";
}

export default function CharacterSelectionModal({ isOpen, onClose }: CharacterSelectionModalProps) {
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
      <ModalHeader
        title="캐릭터 변경"
        subtitle="나를 대표할 캐릭터를 선택하세요"
        onClose={onClose}
      />

      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-[22px]">
        <div className="flex flex-col gap-2">
          {characters.map((character) => (
            <SelectableOptionCard
              key={character.id}
              icon={
                <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e8f5ec]">
                  <img
                    src={character.icon}
                    alt={character.name}
                    className="h-full w-full object-cover"
                  />
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
        <Button
          type="button"
          variant="secondary"
          className="flex-1 text-[14px] font-semibold py-3"
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

