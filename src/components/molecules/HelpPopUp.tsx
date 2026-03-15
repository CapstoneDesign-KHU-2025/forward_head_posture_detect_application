"use client";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { HelpMessageModal } from "@/components/atoms/HelpMessageModal";
export function HelpPopUp() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="fixed bottom-13 right-8 flex flex-col items-end gap-3">
      <HelpMessageModal isOpen={isModalOpen} onClose={() => setIsModalOpen((prev) => !prev)} />
      <Button
        variant="primary"
        className="flex fixed bottom-13 right-8 items-center justify-center !w-14 !h-14 rounded-full shadow-[0_4px_16px_rgba(74,124,89,0.3)] 
    hover:scale-105 hover:shadow-[0_8px_24px_rgba(74,124,89,0.4)]"
        onClick={() => setIsModalOpen((prev) => !prev)}
      >
        tip!
      </Button>
    </div>
  );
}
