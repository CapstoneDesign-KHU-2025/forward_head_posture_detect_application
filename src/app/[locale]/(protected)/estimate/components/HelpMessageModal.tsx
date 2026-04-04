"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/Button";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";

type HelpMessageModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type GuideItem = {
  id: number;
  title: string;
  descriptions: string[];
};

function HelpAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: GuideItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border p-1.5 shadow-md transition-colors duration-300",
        isOpen
          ? "border-[var(--green-light)] bg-[var(--green-pale)]"
          : "border-transparent bg-gray-50 hover:bg-[var(--green-light)]",
      )}
    >
      <Button
        variant="ghost"
        onClick={onToggle}
        className="flex w-full items-start justify-between p-3.5 text-left focus:outline-none"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            "block w-full pr-2 text-left text-[13px] leading-snug font-bold transition-colors",
            isOpen ? "text-[var(--green-dark)]" : "text-gray-700",
          )}
        >
          <span className="mr-1.5 opacity-60">{item.id}.</span>
          {item.title}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "mt-0.5 shrink-0 text-[var(--green)] transition-transform duration-300",
            isOpen ? "rotate-180" : "rotate-0",
          )}
        />
      </Button>

      {/* Grid animation*/}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3.5 pt-0 pb-3.5 text-[13px] leading-relaxed text-[var(--green)]">
            <ul className="flex flex-col gap-1.5">
              {item.descriptions.map((desc, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="mt-0.5 text-[10px] text-[var(--green-mid)]">
                    ●
                  </span>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HelpMessageModal({ isOpen, onClose }: HelpMessageModalProps) {
  const t = useTranslations("HelpMessageModal");
  const [openAccordionId, setOpenAccordionId] = useState<number | null>(1);

  const toggleAccordion = (id: number) => {
    setOpenAccordionId((prev) => (prev === id ? null : id));
  };

  const GUIDE_DATA: GuideItem[] = [
    {
      id: 1,
      title: t("messages.1.title"),
      descriptions: [
        t("messages.1.description.1"),
        t("messages.1.description.2"),
      ],
    },
    {
      id: 2,
      title: t("messages.2.title"),
      descriptions: [
        t("messages.2.description.1"),
        t("messages.2.description.2"),
      ],
    },
    {
      id: 3,
      title: t("messages.3.title"),
      descriptions: [
        t("messages.3.description.1"),
        t("messages.3.description.2"),
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[99] bg-transparent"
        aria-hidden
        onClick={onClose}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "fixed right-6 bottom-16 z-[100] w-[340px] overflow-hidden rounded-[24px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-gray-100 sm:w-[380px]",
          "origin-bottom-right transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-90 opacity-0",
        )}
      >
        <div className="p-5">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-[var(--green-dark)]">
              🐢 {t("header")}
            </h2>
            <Button
              variant="ghost"
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-dark)]"
              aria-label={t("ariaLabel")}
            >
              <X size={18} />
            </Button>
          </header>

          <div className="custom-scrollbar flex max-h-[400px] flex-col gap-2.5 overflow-y-auto pr-1">
            {GUIDE_DATA.map((item) => (
              <HelpAccordionItem
                key={item.id}
                item={item}
                isOpen={openAccordionId === item.id}
                onToggle={() => toggleAccordion(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
