"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/Button";
import CharacterGrid from "./components/CharacterGrid";
import { useTranslations } from "next-intl";
import { useHandleHotKey } from "@/hooks/useHandleHotKey";
const CHARACTER_ASSETS = [
  { id: "remy", icon: "/icons/remy.png" },
  { id: "jerry", icon: "/icons/cat.png" },
  { id: "jessica", icon: "/icons/girl.png" },
];

export default function CharacterSelectionPage() {
  const t = useTranslations("Characters");
  const router = useRouter();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    null,
  );

  const saveCharacterAndRedirect = (characterId: string) => {
    if (typeof window != "undefined") {
      localStorage.setItem("selectedCharacter", characterId);
    }
    router.replace("/");
  };

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacter(characterId);
  };

  const handleConfirm = () => {
    if (selectedCharacter) {
      saveCharacterAndRedirect(selectedCharacter);
    }
  };
  const handleSkip = () => {
    saveCharacterAndRedirect(CHARACTER_ASSETS[1].id);
  };

  useEffect(() => {
    const stored = localStorage.getItem("selectedCharacter");
    if (stored?.trim()) {
      router.replace("/");
    }
  }, [router]);

  useHandleHotKey("Enter", () => {
    if (selectedCharacter) {
      handleConfirm();
    }
  });
  useHandleHotKey("Escape", () => {
    handleSkip();
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--green-pale)] to-[var(--green-light)] p-8">
      <div className="w-full max-w-[1200px] rounded-[24px] bg-white p-12 shadow-[0_10px_40px_rgba(45,95,46,0.15)]">
        {/* header */}
        <div className="mb-12 text-center">
          <div className="mb-4 animate-bounce text-[3rem]">🐢</div>
          <h1 className="mb-2 text-[2rem] font-bold text-[var(--green)]">
            {t("header.title")}
          </h1>
          <p className="text-[1.1rem] text-[var(--text)]">
            {t("header.description")}
          </p>
        </div>

        <div className="mx-auto mb-12 grid max-w-[900px] grid-cols-1 gap-12 md:grid-cols-3">
          {CHARACTER_ASSETS.map((character) => (
            <CharacterGrid
              key={character.id}
              characterObject={{
                ...character,
                name: t(`${character.id}.name`),
                description: t(`${character.id}.description`),
              }}
              handleGridClick={() => handleCharacterSelect(character.id)}
              selectedCharacterId={selectedCharacter}
            />
          ))}
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            variant="secondary"
            onClick={handleSkip}
            className="border-2 border-[var(--green-border)] px-12 py-4 text-[1.1rem] font-semibold"
          >
            {t("buttons.skip")}
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedCharacter}
            className="px-12 py-4 text-[1.1rem] font-semibold disabled:cursor-not-allowed disabled:bg-[var(--disabled-bg)] disabled:shadow-none disabled:hover:transform-none disabled:hover:bg-[var(--disabled-bg-hover)]"
            style={
              !selectedCharacter
                ? {}
                : { boxShadow: "0 4px 15px rgba(45, 95, 46, 0.3)" }
            }
          >
            {t("buttons.done")}
          </Button>
        </div>
      </div>
    </div>
  );
}
