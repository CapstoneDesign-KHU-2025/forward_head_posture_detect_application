"use client";

import { Button } from "@/components/atoms/Button";
import { Modal } from "@/components/common/Modal";
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
    description: "부드럽고 따뜻한\n친근한 캐릭터",
  },
  {
    id: "jerry",
    icon: "/icons/cat.png",
    name: "제리",
    description: "활발하고 귀여운\n사랑스러운 캐릭터",
  },
  {
    id: "jessica",
    icon: "/icons/girl.png",
    name: "제시카",
    description: "우아하고 세련된\n멋진 캐릭터",
  },
];

// localStorage에서 선택한 캐릭터 가져오기
function getSelectedCharacter(): string {
  if (typeof window === "undefined") return "remy";
  const selected = localStorage.getItem("selectedCharacter");
  return selected || "remy";
}

// 캐릭터 이름 가져오기
function getCharacterName(characterId: string): string {
  const character = characters.find((c) => c.id === characterId);
  return character?.name || "래미";
}

export default function CharacterSelectionModal({ isOpen, onClose }: CharacterSelectionModalProps) {
  const [currentCharacter, setCurrentCharacter] = useState<string>("remy");
  const [selectedCharacter, setSelectedCharacter] = useState<string>("remy"); // 임시 선택

  useEffect(() => {
    if (isOpen) {
      const saved = getSelectedCharacter();
      setCurrentCharacter(saved);
      setSelectedCharacter(saved); // 모달 열 때 현재 선택된 캐릭터로 초기화
    }
  }, [isOpen]);

  // 캐릭터 선택 (임시로만 선택, 아직 저장 안 함)
  const handleSelect = (characterId: string) => {
    setSelectedCharacter(characterId);
  };

  // 확인 버튼 클릭 시 실제로 저장하고 모달 닫기
  const handleConfirm = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCharacter", selectedCharacter);
      // storage 이벤트 발생시키기 (다른 컴포넌트에서 감지할 수 있도록)
      window.dispatchEvent(new Event("storage"));
    }
    setCurrentCharacter(selectedCharacter);
    onClose(); // 모달 닫기
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">캐릭터 변경</h2>

        {/* 현재 캐릭터 상태 */}
        <div className="mb-6">
          <p className="text-sm text-black/60 mb-2">현재 캐릭터</p>
          <div className="inline-flex items-center px-4 py-2 bg-black/5 rounded-md">
            <span className="font-semibold text-lg">{getCharacterName(currentCharacter)}</span>
          </div>
        </div>

        {/* 캐릭터 선택 버튼들 */}
        <div className="space-y-3 mb-6">
          <p className="text-sm text-black/60 mb-2">캐릭터 선택하기</p>
          <div className="flex flex-col gap-2">
            {characters.map((character) => (
              <button
                key={character.id}
                onClick={() => handleSelect(character.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-md border-2 transition-all duration-200
                  ${
                    selectedCharacter === character.id
                      ? "bg-[#2D5F2E] text-white border-[#2D5F2E]"
                      : "bg-white text-[#2D5F2E] border-[#4A9D4D] hover:bg-[#F8FBF8]"
                  }
                `}
              >
                <div className="w-10 h-10 flex-shrink-0">
                  <img src={character.icon} alt={character.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{character.name}</div>
                  <div className="text-xs opacity-80 whitespace-pre-line">{character.description}</div>
                </div>
                {selectedCharacter === character.id && (
                  <div className={selectedCharacter === character.id ? "text-white" : "text-[#2D5F2E]"}>✓</div>
                )}
              </button>
            ))}
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
