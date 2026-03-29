"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { useTranslations } from "next-intl";

type TrialIntroGuideModalProps = {
  isOpen: boolean;
  onNext: () => void;
};

export function TrialIntroGuideModal({ isOpen, onNext }: TrialIntroGuideModalProps) {
  const [openAccordionId, setOpenAccordionId] = useState<number | null>(1);
  const tGuide = useTranslations("HelpMessageModal");
  const tTrial = useTranslations("Trial");

  const toggleAccordion = (id: number) => {
    setOpenAccordionId((prev) => (prev === id ? null : id));
  };

  const GUIDE_DATA = [
    {
      id: 1,
      title: tGuide("messages.1.title"),
      descriptions: [tGuide("messages.1.description.1"), tGuide("messages.1.description.2")],
    },
    {
      id: 2,
      title: tGuide("messages.2.title"),
      descriptions: [tGuide("messages.2.description.1"), tGuide("messages.2.description.2")],
    },
    {
      id: 3,
      title: tGuide("messages.3.title"),
      descriptions: [tGuide("messages.3.description.1"), tGuide("messages.3.description.2")],
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="trial-intro-title"
        className="relative z-[1] flex max-h-[min(90dvh,720px)] w-full max-w-[420px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)] ring-1 ring-[var(--green-border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
          <header className="mb-3 shrink-0">
            <h2 id="trial-intro-title" className="text-lg font-bold text-[var(--green-dark)]">
              🐢 {tGuide("header")}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-sub)]">{tTrial("intro.subtitle")}</p>
          </header>

          <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
            {GUIDE_DATA.map((item) => {
              const isAccordionOpen = openAccordionId === item.id;
              return (
                <div
                  key={item.id}
                  className={`overflow-hidden rounded-2xl border p-1.5 shadow-sm transition-colors duration-300 ${
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
                      className={`block w-full pr-2 text-left text-[13px] font-bold leading-snug ${isAccordionOpen ? "text-[var(--green-dark)]" : "text-gray-700"}`}
                    >
                      <span className="mr-1.5 opacity-60">{item.id}.</span>
                      {item.title}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`mt-0.5 shrink-0 text-[var(--green)] transition-transform duration-300 ${isAccordionOpen ? "rotate-180" : "rotate-0"}`}
                    />
                  </Button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isAccordionOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-3.5 pb-3.5 pt-0 text-[13px] leading-relaxed text-[var(--green)]">
                        <ul className="flex flex-col gap-1.5">
                          {item.descriptions.map((desc, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="mt-0.5 text-[10px] text-[var(--green-mid)]">●</span>
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

          <div className="mt-4 shrink-0 border-t border-[var(--green-border)] pt-4">
            <Button size="lg" variant="primary" className="w-full" onClick={onNext}>
              {tTrial("intro.next")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
