"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/Button";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";
import { tv } from "tailwind-variants";
import { contain } from "three/src/extras/TextureUtils.js";

const accordionStyles = tv({
  slots: {
    container:
      "overflow-hidden rounded-2xl border p-1.5 shadow-md transition-colors duration-300",
    triggerBtn:
      "flex w-full items-start justify-between p-3.5 text-left focus:outline-none",
    titleLabel:
      "block w-full pr-2 text-left text-[13px] leading-snug font-bold transition-colors",
    numberSpan: "mr-1.5 opacity-60",
    chevron: "mt-0.5 shrink-0 transition-transform duration-300",
    contentWrapper: "grid transition-all duration-300 ease-in-out",
    contentInner: "overflow-hidden",
    listContainer:
      "px-3.5 pt-0 pb-3.5 text-[13px] leading-relaxed text-[var(--green)]",
    ul: "flex flex-col gap-1.5",
    li: "flex items-start gap-1.5",
    bullet: "mt-0.5 text-[10px] text-[var(--green-mid)]",
  },
  variants: {
    isOpen: {
      true: {
        container: "border-[var(--green-light)] bg-[var(--green-pale)]",
        titleLabel: "text-[var(--green-dark)]",
        chevron: "rotate-180 text-[var(--green)]",
        contentWrapper: "grid-rows-[1fr] opacity-100",
      },
      false: {
        container:
          "border-transparent bg-gray-50 hover:bg-[var(--green-light)]",
        titleLabel: "text-gray-700",
        chevron: "rotate-0 text-[var(--green)]",
        contentWrapper: "grid-rows-[0fr] opacity-0",
      },
    },
  },
});

const modalStyles = tv({
  slots: {
    backdrop: "fixed inset-0 z-[99] bg-transparent",
    panel:
      "fixed right-6 bottom-16 z-[100] w-[340px] origin-bottom-right overflow-hidden rounded-[24px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-gray-100 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] sm:w-[380px]",
    panelInner: "p-5",
    header: "mb-4 flex items-center justify-between",
    title: "text-[17px] font-bold text-[var(--green-dark)]",
    closeBtn:
      "rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-dark)]",
    scrollArea:
      "custom-scrollbar flex max-h-[400px] flex-col gap-2.5 overflow-y-auto pr-1",
  },
  variants: {
    isOpen: {
      true: { panel: "translate-y-0 scale-100 opacity-100" },
      false: { panel: "pointer-events-none translate-y-4 scale-90 opacity-0" },
    },
  },
});

type HelpMessageModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type GuideItem = {
  id: number;
  title: string;
  descriptions: string[];
};

type helpAccordionItemProps = {
  item: GuideItem;
  isOpen: boolean;
  onToggle: () => void;
};

function HelpAccordionItem({ item, isOpen, onToggle }: helpAccordionItemProps) {
  const {
    container,
    triggerBtn,
    titleLabel,
    numberSpan,
    chevron,
    contentWrapper,
    contentInner,
    listContainer,
    ul,
    li,
    bullet,
  } = accordionStyles({ isOpen });
  return (
    <div className={container()}>
      <Button
        variant="ghost"
        onClick={onToggle}
        className={triggerBtn()}
        aria-expanded={isOpen}
      >
        <span className={titleLabel()}>
          <span className={numberSpan()}>{item.id}.</span>
          {item.title}
        </span>
        <ChevronDown size={16} className={chevron()} />
      </Button>

      <div
        id={`accordion-content-${item.id}`}
        role="region"
        aria-labelledby={`accordion-trigger-${item.id}`}
        className={contentWrapper()}
      >
        <div className={contentInner()}>
          <div className={listContainer()}>
            <ul className={ul()}>
              {item.descriptions.map((desc, idx) => (
                <li key={idx} className={li()}>
                  <span className={bullet()}>●</span>
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
  const { backdrop, panel, panelInner, header, title, closeBtn, scrollArea } =
    modalStyles({ isOpen });
  return (
    <>
      {isOpen && <div className={backdrop()} aria-hidden onClick={onClose} />}

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        onClick={(e) => e.stopPropagation()}
        className={panel()}
      >
        <div className={panelInner()}>
          <header className={header()}>
            <h2 id="help-modal-title" className={title()}>
              <span aria-hidden>🐢 </span>
              {t("header")}
            </h2>
            <Button
              variant="ghost"
              onClick={onClose}
              className={closeBtn()}
              aria-label={t("ariaLabel")}
            >
              <X size={18} aria-hidden />
            </Button>
          </header>

          <div className={scrollArea()}>
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
      </section>
    </>
  );
}
