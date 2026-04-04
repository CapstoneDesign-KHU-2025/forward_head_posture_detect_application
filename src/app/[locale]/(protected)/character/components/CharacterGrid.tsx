"use client";

import Image from "next/image";
import React from "react";
import { cn } from "@/utils/cn";

type CharacterGridProps = {
  characterObject: {
    id: string;
    icon: string;
    name: string;
    description: string;
  };
  handleGridClick: () => void;
  selectedCharacterId: string | null;
};

export default function CharacterGrid({
  characterObject,
  handleGridClick,
  selectedCharacterId,
}: CharacterGridProps) {
  const isSelected = selectedCharacterId === characterObject.id;
  return (
    <div
      onClick={handleGridClick}
      className={cn(
        "relative cursor-pointer rounded-2xl border-[3px] border-transparent bg-[var(--green-pale)] px-6 py-8 text-center transition-all duration-300",
        "hover:-translate-y-2 hover:border-[var(--green-border-dark)] hover:shadow-[0_8px_25px_rgba(45,95,46,0.2)]",
        isSelected &&
          "shadow-[0_8px_25px_rgba(74, 157, 77, 0.3)] border-[var(--green-border-dark)] bg-gradient-to-br from-[var(--green-light)] to-[var(--green-pale)]",
      )}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[var(--green)] text-[1.2rem] font-bold text-white">
          ✓
        </div>
      )}
      <div className="relative mx-auto mb-4 h-24 w-24">
        <Image src={characterObject.icon} alt={characterObject.name} fill />
      </div>
      <div className="mb-2 text-[1.2rem] font-bold text-[var(--green)]">
        {characterObject.name}
      </div>
      <div className="text-[0.9rem] leading-[1.4] whitespace-pre-line text-[var(--text)]">
        {characterObject.description}
      </div>
    </div>
  );
}
