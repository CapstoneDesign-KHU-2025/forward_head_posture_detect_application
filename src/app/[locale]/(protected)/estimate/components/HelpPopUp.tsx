"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { HelpMessageModal } from "./HelpMessageModal";
import { useBoogiTipStatus } from "@/hooks/useBoogiTipStatus";
import { tv } from "tailwind-variants";

const popUpStyles = tv({
  slots: {
    wrapper: "fixed right-6 bottom-3 z-[999] flex flex-col items-end gap-3",
    tipBtn:
      "flex !h-14 !w-14 items-center justify-center rounded-full shadow-[0_4px_16px_rgba(74,124,89,0.3)] transition-transform hover:scale-105 hover:shadow-[0_8px_24px_rgba(74,124,89,0.4)]",
  },
  variants: {
    needsAttention: {
      true: { tipBtn: "animate-shara-attention" },
    },
  },
});

export function HelpPopUp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { hasNeverClicked, markAsVisited } = useBoogiTipStatus();

  const handleButtonClick = () => {
    setIsModalOpen((prev) => !prev);
    markAsVisited();
  };
  const { wrapper, tipBtn } = popUpStyles({
    needsAttention: hasNeverClicked && !isModalOpen,
  });
  return (
    <div className={wrapper()}>
      <HelpMessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <Button
        variant="primary"
        className={tipBtn()}
        onClick={handleButtonClick}
      >
        TIP!
      </Button>
    </div>
  );
}
