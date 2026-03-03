"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import CharacterGrid from "@/components/molecules/CharacterGrid";
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
export default function CharacterSelectionPage() {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const router = useRouter();

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacter(characterId);
  };

  const handleConfirm = () => {
    if (selectedCharacter) {
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedCharacter", selectedCharacter);
      }
      router.push("/");
    }
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCharacter", "remy");
    }
    router.push("/");
  };

  // 이미 캐릭터가 선택돼 있으면 홈으로 바로 이동 (로그인 후 /character 콜백 시 스킵)
  useEffect(() => {
    const stored = localStorage.getItem("selectedCharacter");
    if (stored?.trim()) {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && selectedCharacter) {
        handleConfirm();
      } else if (e.key === "Escape") {
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCharacter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--green-pale)] to-[#E8F5E9] flex items-center justify-center p-8">
      <div className="max-w-[1200px] w-full bg-white rounded-[24px] p-12 shadow-[0_10px_40px_rgba(45,95,46,0.15)]">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="text-[3rem] mb-4 animate-bounce">🐢</div>
          <h1 className="text-[2rem] text-[#2D5F2E] mb-2 font-bold">나만의 3D 캐릭터를 선택하세요!</h1>
          <p className="text-[1.1rem] text-[#4F4F4F]">측정 중 화면에 표시될 캐릭터를 골라주세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 max-w-[900px] mx-auto">
          {characters.map((character) => (
            <CharacterGrid
              key={character.id}
              characterObject={character}
              handleGridClick={() => handleCharacterSelect(character.id)}
              selectedCharacterId={selectedCharacter}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="secondary"
            onClick={handleSkip}
            className="px-12 py-4 text-[1.1rem] font-semibold border-2 border-[#2D5F2E]"
          >
            건너뛰기
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedCharacter}
            className="px-12 py-4 text-[1.1rem] font-semibold disabled:bg-[#9CA3AF] disabled:cursor-not-allowed disabled:hover:bg-[#9CA3AF] disabled:hover:transform-none disabled:shadow-none"
            style={!selectedCharacter ? {} : { boxShadow: "0 4px 15px rgba(45, 95, 46, 0.3)" }}
          >
            선택 완료
          </Button>
        </div>
      </div>
    </div>
  );
}
