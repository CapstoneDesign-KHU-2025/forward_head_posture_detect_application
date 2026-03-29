"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { useTranslations } from "next-intl";

type HelpMessageModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function HelpMessageModal({ isOpen, onClose }: HelpMessageModalProps) {
  const [openAccordionId, setOpenAccordionId] = useState<number | null>(1);

  const toggleAccordion = (id: number) => {
    setOpenAccordionId((prev) => (prev === id ? null : id));
  };
  const t = useTranslations("HelpMessageModal");
  const GUIDE_DATA = [
    {
      id: 1,
      title: t("messages.1.title"),
      descriptions: [t("messages.1.description.1"), t("messages.1.description.2")],
    },
    {
      id: 2,
      title: t("messages.2.title"),
      descriptions: [t("messages.2.description.1"), t("messages.2.description.2")],
    },
    {
      id: 3,
      title: t("messages.3.title"),
      descriptions: [t("messages.3.description.1"), t("messages.3.description.2")],
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* backdrop: click outside to close */}
      <div
        className="fixed inset-0 z-[99] bg-transparent"
        aria-hidden
        onClick={onClose}
      />
      <div
        className={`fixed bottom-16 right-6 z-[100] w-[340px] sm:w-[380px] overflow-hidden rounded-[24px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-gray-100 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right ${
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-4 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
      <div className="p-5">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-[var(--green-dark)]">🐢 {t("header")}</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-dark)]"
            aria-label={t("ariaLabel")}
          >
            <X size={18} />
          </Button>
        </header>

        {/* accordion list*/}
        <div className="flex max-h-[400px] flex-col gap-2.5 overflow-y-auto pr-1 custom-scrollbar">
          {GUIDE_DATA.map((item) => {
            const isAccordionOpen = openAccordionId === item.id;

            return (
              <div
                key={item.id}
                className={`overflow-hidden rounded-2xl border transition-colors duration-300 p-1.5 shadow-md ${
                  isAccordionOpen
                    ? "border-[var(--green-light)] bg-[var(--green-pale)]"
                    : "border-transparent bg-gray-50 hover:bg-[var(--green-light)]"
                }`}
              >
                <Button
                  variant="ghost"
                  onClick={() => toggleAccordion(item.id)}
                  className="flex w-full items-start justify-between p-3.5 text-left focus:outline-none"
                  aria-expanded={isAccordionOpen}
                >
                  <span
                    className={`block w-full pr-2 text-left text-[13px] font-bold leading-snug transition-colors ${isAccordionOpen ? "text-[var(--green-dark)]" : "text-gray-700"}`}
                  >
                    <span className="mr-1.5 opacity-60">{item.id}.</span>
                    {item.title}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`mt-0.5 shrink-0 text-[var(--green)] transition-transform duration-300 ${isAccordionOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </Button>

                {/* animation for lists*/}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isAccordionOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-3.5 pb-3.5 pt-0 text-[13px] leading-relaxed text-[var(--green)]">
                      <ul className="flex flex-col gap-1.5">
                        {item.descriptions.map((desc, idx) => (
                          <li key={idx} className="flex gap-1.5 items-start">
                            <span className="mt-0.5 text-[var(--green-mid)] text-[10px]">●</span>
                            <span>{desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
