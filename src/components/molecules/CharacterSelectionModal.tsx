"use client";

import { SectionLabel } from "@/components/atoms/SectionLabel";
import { Modal } from "@/components/common/Modal";
import { ModalHeader } from "@/components/common/ModalHeader";
import { cn } from "@/utils/cn";
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

function getCharacterName(characterId: string): string {
  const character = characters.find((c) => c.id === characterId);
  return character?.name || "래미";
}

export default function CharacterSelectionModal({ isOpen, onClose }: CharacterSelectionModalProps) {
  const [currentCharacter, setCurrentCharacter] = useState<string>("remy");
  const [selectedCharacter, setSelectedCharacter] = useState<string>("remy");

  useEffect(() => {
    if (isOpen) {
      const saved = getSelectedCharacter();
      setCurrentCharacter(saved);
      setSelectedCharacter(saved);
    }
  }, [isOpen]);

  const handleSelect = (characterId: string) => setSelectedCharacter(characterId);

  const handleConfirm = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCharacter", selectedCharacter);
      window.dispatchEvent(new Event("storage"));
    }
    setCurrentCharacter(selectedCharacter);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-[440px] w-full">
      <ModalHeader
        title="캐릭터 변경"
        subtitle="나를 대표할 캐릭터를 골라보세요"
        onClose={onClose}
      />
      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-[22px]">
        <div className="mb-5">
          <SectionLabel>현재 캐릭터</SectionLabel>
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-[#d4ead9] bg-[#f4faf6] px-3.5 py-1.5">
            <img
              src={characters.find((c) => c.id === currentCharacter)?.icon ?? "/icons/remy.png"}
              alt=""
              className="h-5 w-5 object-contain"
            />
            <span className="text-[14px] font-semibold text-[#4a7c59]">
              {getCharacterName(currentCharacter)}
            </span>
          </div>
        </div>

        <div>
          <SectionLabel>캐릭터 선택하기</SectionLabel>
          <div className="flex flex-col gap-2">
            {characters.map((character) => (
              <button
                key={character.id}
                type="button"
                onClick={() => handleSelect(character.id)}
                className={cn(
                  "flex items-center gap-3.5 rounded-2xl border-[1.5px] bg-white px-4 py-3 transition-all duration-[180ms]",
                  "hover:border-[#6aab7a] hover:bg-[#f9fdf9]",
                  selectedCharacter === character.id
                    ? "border-[#4a7c59] bg-[#f0f9f3] shadow-[0_2px_10px_rgba(74,124,89,0.12)]"
                    : "border-[#e4f0e8]"
                )}
              >
                <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e8f5ec]">
                  <img
                    src={character.icon}
                    alt={character.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="mb-0.5 text-base font-semibold text-[#2d3b35]">{character.name}</div>
                  <div className="text-sm leading-relaxed text-[#7a9585]">
                    {character.description}
                  </div>
                </div>
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-[180ms]",
                    selectedCharacter === character.id
                      ? "border-[#4a7c59] bg-[#4a7c59]"
                      : "border-[#d4ead9]"
                  )}
                >
                  {selectedCharacter === character.id && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 gap-2.5 px-6 pb-[22px]">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-[14px] border-[1.5px] border-[#d4ead9] bg-white px-3 py-3 text-[14px] font-semibold text-[#7a9585] transition-colors hover:border-[#6aab7a] hover:bg-[#f4faf6] hover:text-[#4a7c59]"
        >
          닫기
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 rounded-[14px] border-none bg-[#4a7c59] px-3 py-3 text-[14px] font-bold text-white transition-all hover:translate-y-[-1px] hover:bg-[#3a6147] hover:shadow-[0_4px_12px_rgba(74,124,89,0.25)]"
        >
          확인
        </button>
      </div>
    </Modal>
  );
}
