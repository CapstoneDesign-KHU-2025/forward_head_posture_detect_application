"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "./Button";

const GUIDE_DATA = [
  {
    id: 1,
    title: "기기는 정면에 놓아주세요.",
    descriptions: [
      "노트북을 앞에 두고 업무하는 환경에 적합하도록, AI 모델이 인체의 '정면'을 기준으로 학습되어 있어요!",
      "혹시 측면 측정 기능도 원하시면 피드백을 남겨주세요 🐢",
    ],
  },
  {
    id: 2,
    title: "평소 업무/공부할 때의 자세로 측정해주세요.",
    descriptions: [
      "측정 시작 시점에 수집한 기본 자세를 바탕으로 거북목을 판단합니다.",
      "카메라의 각도나 방향이 틀어지지 않을수록 신체 인식이 훨씬 정확해져요!",
    ],
  },
  {
    id: 3,
    title: "얇은 옷과 묶은 머리가 측정에 도움이 됩니다.",
    descriptions: [
      "AI 모델은 어깨와 귀의 위치를 인식해서 각도를 계산해요.",
      "두꺼운 옷이나 긴 머리로 어깨선이 가려지면 정확도가 떨어질 수 있습니다!",
    ],
  },
];

type HelpMessageModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function HelpMessageModal({ isOpen, onClose }: HelpMessageModalProps) {
  const [openAccordionId, setOpenAccordionId] = useState<number | null>(1); // 1번 기본 열림

  const toggleAccordion = (id: number) => {
    setOpenAccordionId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className={`relative bottom-16 w-[340px] sm:w-[380px] overflow-hidden rounded-[24px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-gray-100 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right ${
        isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="p-5">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-[#2d4a36]">🐢 측정 가이드 팁</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a7c59]"
            aria-label="가이드 닫기"
          >
            <X size={18} />
          </Button>
        </header>

        {/* 아코디언 리스트 */}
        <div className="flex max-h-[400px] flex-col gap-2.5 overflow-y-auto pr-1 custom-scrollbar">
          {GUIDE_DATA.map((item) => {
            const isAccordionOpen = openAccordionId === item.id;

            return (
              <div
                key={item.id}
                className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                  isAccordionOpen ? "border-[#4a7c59] bg-[#f4f9f5]" : "border-transparent bg-gray-50 hover:bg-[#edf5f0]"
                }`}
              >
                <Button
                  variant="ghost"
                  onClick={() => toggleAccordion(item.id)}
                  className="flex w-full items-start justify-between p-3.5 text-left focus:outline-none"
                  aria-expanded={isAccordionOpen}
                >
                  <span
                    className={`text-[14px] font-bold leading-snug transition-colors pr-2 ${isAccordionOpen ? "text-[#4a7c59]" : "text-gray-700"}`}
                  >
                    <span className="mr-1.5 opacity-60">{item.id}.</span>
                    {item.title}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`mt-0.5 shrink-0 text-[#4a7c59] transition-transform duration-300 ${isAccordionOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </Button>

                {/* 💡 높이 애니메이션 로직 */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isAccordionOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-3.5 pb-3.5 pt-0 text-[13px] leading-relaxed text-[#5a7564]">
                      <ul className="flex flex-col gap-1.5">
                        {item.descriptions.map((desc, idx) => (
                          <li key={idx} className="flex gap-1.5 items-start">
                            <span className="mt-0.5 text-[#84a98f] text-[10px]">●</span>
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
  );
}
