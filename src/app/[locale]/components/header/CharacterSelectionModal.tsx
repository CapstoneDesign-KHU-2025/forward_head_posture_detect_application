"use client";

import Image from "next/image";
import { Modal } from "@/components/Modal";
import { ModalHeader } from "@/components/ModalHeader";
import { Button } from "@/components/Button";
import { SelectableOptionCard } from "@/components/SelectableOptionCard";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { tv } from "tailwind-variants";

const modalStyles = {
  content: tv({
    base: "w-full max-w-[420px] rounded-[22px] shadow-[0_20px_60px_rgba(45,59,53,0.18)]"
  }), 
  footerButton: tv({
  base: "flex-1 py-3 text-[14px]",
  variants: {
    weight: { semibold: "font-semibold" },
  },
})
}


function CharacterIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e8f5ec]">
      <Image src={src} alt={alt} width={52} height={52} className="object-cover" />
    </div>
  );
}

type CharacterSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function getSelectedCharacter(): string {
  if (typeof window === "undefined") return "remy";
  return localStorage.getItem("selectedCharacter") ?? "remy";
}

export default function CharacterSelectionModal({ isOpen, onClose }: CharacterSelectionModalProps) {
  const t_char = useTranslations("Characters");
  const t = useTranslations("CharacterSelectionModal");

  const characters = useMemo(() => [
    { id: "remy",     icon: "/icons/remy.png",  name: t_char("remy.name"),     description: t_char("remy.description") },
    { id: "jerry",    icon: "/icons/cat.png",   name: t_char("jerry.name"),    description: t_char("jerry.description") },
    { id: "jessica",  icon: "/icons/girl.png",  name: t_char("jessica.name"),  description: t_char("jessica.description") },
  ], [t_char]);

  const [selectedCharacter, setSelectedCharacter] = useState<string>("remy");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCharacter(getSelectedCharacter());
  }, [isOpen]);

  const handleConfirm = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCharacter", selectedCharacter);
      window.dispatchEvent(new Event("storage"));
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName={modalStyles.content()}>
      <ModalHeader title={t("ModalHeader.title")} subtitle={t("ModalHeader.subtitle")} onClose={onClose} />
      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-[22px]">
        <div className="flex flex-col gap-2">
          {characters.map((character) => (
            <SelectableOptionCard
              key={character.id}
              icon={<CharacterIcon src={character.icon} alt={character.name} />}
              title={character.name}
              description={character.description}
              isSelected={selectedCharacter === character.id}
              onClick={() => setSelectedCharacter(character.id)}
            />
          ))}
        </div>
      </div>
      <div className="flex shrink-0 gap-2.5 px-6 py-3.5">
        <Button type="button" variant="secondary" className={modalStyles.footerButton({ weight: "semibold" })} onClick={onClose}>
          {t("button.close")}
        </Button>
        <Button type="button" variant="primary" className={modalStyles.footerButton()} onClick={handleConfirm}>
          {t("button.confirm")}
        </Button>
      </div>
    </Modal>
  );
}
