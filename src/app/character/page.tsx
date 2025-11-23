"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button";

export default function CharacterSelectionPage() {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const router = useRouter();

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

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacter(characterId);
  };

  const handleConfirm = () => {
    if (selectedCharacter) {
      // 선택된 캐릭터 저장 (나중에 백엔드로 전송)
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedCharacter", selectedCharacter);
        // 홈페이지로 이동
        window.location.href = "/";
      } else {
        router.push("/");
      }
    }
  };

  const handleSkip = () => {
    // 기본 캐릭터 설정
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCharacter", "remy");
      // 홈페이지로 이동
      window.location.href = "/";
    } else {
      router.push("/");
    }
  };

  // 키보드 단축키
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
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBF8] to-[#E8F5E9] flex items-center justify-center p-8">
      <div className="max-w-[1200px] w-full bg-white rounded-[24px] p-12 shadow-[0_10px_40px_rgba(45,95,46,0.15)]">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="text-[3rem] mb-4 animate-bounce">🐢</div>
          <h1 className="text-[2rem] text-[#2D5F2E] mb-2 font-bold">나만의 3D 캐릭터를 선택하세요!</h1>
          <p className="text-[1.1rem] text-[#4F4F4F]">측정 중 화면에 표시될 캐릭터를 골라주세요</p>
        </div>

        {/* 캐릭터 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 max-w-[900px] mx-auto">
          {characters.map((character) => (
            <div
              key={character.id}
              onClick={() => handleCharacterSelect(character.id)}
              className={`
                bg-[#F8FBF8] rounded-2xl py-8 px-6 text-center cursor-pointer transition-all duration-300
                border-[3px] border-transparent relative
                hover:-translate-y-2 hover:shadow-[0_8px_25px_rgba(45,95,46,0.2)] hover:border-[#7BC67E]
                ${
                  selectedCharacter === character.id
                    ? "bg-gradient-to-br from-[#E8F5E9] to-[#F0F9F0] border-[#4A9D4D] shadow-[0_8px_25px_rgba(74,157,77,0.3)]"
                    : ""
                }
              `}
            >
              {selectedCharacter === character.id && (
                <div className="absolute top-4 right-4 bg-[#4A9D4D] text-white w-[30px] h-[30px] rounded-full flex items-center justify-center font-bold text-[1.2rem]">
                  ✓
                </div>
              )}
              <div className="w-24 h-24 mx-auto mb-4">
                <img src={character.icon} alt={character.name} className="w-full h-full object-contain" />
              </div>
              <div className="text-[1.2rem] font-bold text-[#2D5F2E] mb-2">{character.name}</div>
              <div className="text-[0.9rem] text-[#4F4F4F] leading-[1.4] whitespace-pre-line">
                {character.description}
              </div>
            </div>
          ))}
        </div>

        {/* 버튼 영역 */}
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

