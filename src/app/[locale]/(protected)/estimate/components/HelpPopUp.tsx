"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { HelpMessageModal } from "./HelpMessageModal";

export function HelpPopUp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasNeverClicked, setHasNeverClicked] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem("boogi_tip_visited");
    if (!visited) {
      setHasNeverClicked(true);
    }
  }, []);

  const handleButtonClick = () => {
    setIsModalOpen((prev) => !prev);

    if (hasNeverClicked) {
      setHasNeverClicked(false);
      localStorage.setItem("boogi_tip_visited", "true");
    }
  };

  return (
    <div className="fixed bottom-3 right-6 flex flex-col items-end gap-3 z-999">
      <HelpMessageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Button
        variant="primary"
        className={`flex fixed bottom-3 right-6 items-center justify-center !w-14 !h-14 rounded-full shadow-[0_4px_16px_rgba(74,124,89,0.3)] 
    hover:scale-105 hover:shadow-[0_8px_24px_rgba(74,124,89,0.4)] ${hasNeverClicked && !isModalOpen ? "animate-shara-attention" : ""}`}
        onClick={handleButtonClick}
      >
        TIP!
      </Button>
    </div>
  );
}
