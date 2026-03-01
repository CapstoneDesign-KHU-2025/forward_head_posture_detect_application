"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import TurtleLogo from "@/components/atoms/TurtleLogo";

const FEATURES = [
  {
    icon: "📷",
    title: "실시간 자세 감지",
    desc: "MediaPipe 기반 AI가 웹캠으로 목 각도를 실시간으로 측정하고, 거북목이 감지되면 즉시 알려드려요.",
  },
  {
    icon: "📊",
    title: "상세 통계 분석",
    desc: "시간대별 목 각도, 일별 경고 횟수, 누적 평균을 시각화해 내 자세 패턴을 한눈에 파악할 수 있어요.",
  },
  {
    icon: "🏆",
    title: "거북이 성장 시스템",
    desc: "자세가 좋은 날이 쌓일수록 거북이가 진화해요. 알 → 아기 → 성인 → 거북왕까지 함께 성장해봐요!",
  },
  {
    icon: "📅",
    title: "캘린더 기록",
    desc: "매일의 자세 상태를 캘린더로 확인하세요. 좋은 날과 경고가 많은 날을 색상으로 구분해서 보여줘요.",
  },
  {
    icon: "👥",
    title: "친구와 함께",
    desc: "친구를 추가하고 자세 관리를 함께해요. 서로의 진행 상황을 보며 동기부여를 받을 수 있어요.",
  },
  {
    icon: "🔔",
    title: "스마트 알림",
    desc: "민감도 설정으로 나에게 맞는 알림을 받아보세요. 낮음 · 보통 · 높음 세 단계로 조절할 수 있어요.",
  },
];

export default function LandingTemplate() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToHow = () => {
    document.getElementById("how")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[var(--green-pale)] text-[var(--text)] overflow-x-clip">
      {/* HERO */}
      <section
        className="flex items-center justify-center relative overflow-hidden"
        style={{ minHeight: "calc(100vh - var(--header-height))" }}
      >
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16 px-6 relative z-10">
          <div>
            <h1
              className="landing-hero-fade-up-1 font-[Nunito] text-[clamp(2rem,4vw,3.2rem)] font-black leading-tight text-[var(--text)] mb-4"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              목이 아프기 전에,
              <br />
              <span className="text-[var(--green)]">거북목을 잡아요</span>
            </h1>
            <p className="landing-hero-fade-up-2 text-base text-[var(--text-sub)] leading-[1.75] mb-9 font-normal">
              카메라 한 대로 충분해요.
              <br />
              실시간으로 자세를 감지하고, 거북목이 되는 순간 바로 알려드려요.
            </p>
            <div className="landing-hero-fade-up-3 flex gap-3 items-center flex-wrap">
              <Button
                size="lg"
                variant="primary"
                className="inline-flex items-center gap-2 py-3.5 px-7 rounded-[14px] text-[15px] font-bold shadow-[0_4px_16px_rgba(74,124,89,0.3)] hover:shadow-[0_8px_24px_rgba(74,124,89,0.35)] hover:-translate-y-0.5"
                onClick={() => signIn()}
              >
                무료로 시작하기 🐢
              </Button>
              <button
                type="button"
                onClick={scrollToHow}
                className="group inline-flex items-center gap-1.5 text-[var(--text-sub)] text-sm font-semibold border-none bg-transparent cursor-pointer transition-colors hover:text-[var(--green)]"
              >
                어떻게 작동하나요 <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>

          {/* TurtleLogo */}
          <div className="landing-hero-scale-in flex justify-center items-center">
            <TurtleLogo />
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-[1080px] mx-auto">
          <h2 className="reveal text-[clamp(28px,4vw,40px)] font-black text-[var(--text)] leading-tight mb-3" style={{ fontFamily: "Nunito, sans-serif" }}>
            현대인의 건강은 잦은 컴퓨터 사용으로
            <br />
            위협받고 있어요
          </h2>
          <p className="reveal text-base text-[var(--text-sub)] mx-auto mb-12 max-w-[520px] leading-[1.7]">
            어떻게 하면 업무를 하는 동안
            <br />
            올바른 자세를 유지할 수 있을까?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 reveal">
            {[
              { icon: "💻", num: "5시간+", label: "하루 평균 컴퓨터 사용 시간", source: "출처 | 방송통신위원회의 스마트폰·PC\n이용 행태 조사" },
              { icon: "🐢", num: "70%", label: "현대인 거북목 유병률", source: "출처 | 질병관리청" },
              { icon: "⚖️", num: "15kg+", label: "잘못된 자세로 인한 목 부담", source: "출처 | 질병관리청" },
            ].map((stat) => (
              <Card
                key={stat.num}
                className="rounded-[20px] p-9 text-center transition-all duration-250 hover:-translate-y-1"
              >
                <div className="text-[28px] mb-3">{stat.icon}</div>
                <div className="font-[Nunito] text-[clamp(36px,5vw,52px)] font-black text-[var(--green)] leading-none mb-0">
                  {stat.num}
                </div>
                <div className="w-8 h-0.5 bg-[#d4ead9] rounded mx-auto my-2.5" />
                <div className="text-[15px] font-semibold text-[var(--text)] mb-2.5">{stat.label}</div>
                <div className="text-xs text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{stat.source}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-[100px] px-6 md:px-12 text-center max-w-[1100px] mx-auto">
        <h2 className="reveal font-[Nunito] text-[clamp(28px,4vw,40px)] font-black tracking-tight mb-3 leading-tight">
          거북목 탈출을 위한
          <br />
          모든 것
        </h2>
        <p className="reveal text-base text-[var(--text-sub)] max-w-[520px] mx-auto mb-14 leading-[1.7]">
          측정부터 분석, 게임화까지 — 바른 자세를 재미있게 만들어요.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <Card
              key={f.title}
              className={`reveal ${["reveal-delay-1", "reveal-delay-2", "reveal-delay-3"][i % 3]} rounded-[20px] p-8 text-left transition-all duration-250 hover:-translate-y-1`}
            >
              <div className="w-[52px] h-[52px] bg-[var(--green-light)] rounded-[14px] flex items-center justify-center text-[26px] mb-4">
                {f.icon}
              </div>
              <div className="font-[Nunito] font-extrabold text-[17px] mb-2">{f.title}</div>
              <div className="text-sm text-[var(--text-sub)] leading-relaxed">{f.desc}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* MOCKUP */}
      <section className="py-[100px] px-6 md:px-12 max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal font-[Nunito] text-[clamp(28px,4vw,40px)] font-black tracking-tight mb-3 leading-tight">
            깔끔하고
            <br />
            직관적인 대시보드
          </h2>
          <p className="reveal text-base text-[var(--text-sub)] mb-7 max-w-[520px] leading-[1.7]">
            복잡하지 않아요. 열면 바로 오늘의 자세 상태를 확인할 수 있어요.
          </p>
          <div className="reveal flex flex-col gap-4">
            {[
              { num: 1, title: "오늘의 목 상태 한눈에", sub: "측정 시간, 경고 횟수, 평균 각도를 카드로 확인" },
              { num: 2, title: "3D 캐릭터로 시각화", sub: "내 목각도에 맞춰 캐릭터 자세가 실시간으로 반영" },
              { num: 3, title: "거북이 진화 현황", sub: "좋은 자세를 유지할수록 거북이가 성장" },
            ].map((p) => (
              <div key={p.num} className="flex items-start gap-3.5">
                <div className="w-7 h-7 bg-[var(--green)] text-white rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 mt-0.5">
                  {p.num}
                </div>
                <div>
                  <strong className="block text-sm font-bold mb-0.5">{p.title}</strong>
                  <span className="text-[13px] text-[var(--text-sub)]">{p.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card className="reveal rounded-[24px] border border-[var(--green-border)] overflow-hidden">
          <div className="bg-[var(--green-pale)] border-b border-[var(--green-border)] py-3 px-4 flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff6b6b]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffd93d]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#6bcb77]" />
          </div>
          <div className="p-5 flex flex-col gap-3">
            <div className="bg-gradient-to-br from-[var(--green)] to-[var(--green-mid)] rounded-[14px] p-4 text-white">
              <div className="font-[Nunito] font-extrabold text-[15px] mb-1">Jimin Nam 님, 안녕하세요! 👋</div>
              <div className="text-[11px] opacity-80">오늘도 바른 자세로 하루를 시작해봐요 🐢</div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[var(--green-pale)] border border-[var(--green-border)] rounded-xl p-3.5">
                <div className="text-[10px] text-[var(--text-muted)] mb-1">측정 시간</div>
                <div className="font-[Nunito] font-extrabold text-lg text-[var(--green)]">2h 14m</div>
              </div>
              <div className="bg-[var(--green-pale)] border border-[var(--green-border)] rounded-xl p-3.5">
                <div className="text-[10px] text-[var(--text-muted)] mb-1">오늘 경고</div>
                <div className="font-[Nunito] font-extrabold text-lg text-[var(--danger-text)]">3회</div>
              </div>
            </div>
            <div className="bg-[var(--green-pale)] border border-[var(--green-border)] rounded-xl p-3.5">
              <div className="text-[10px] text-[var(--text-muted)] mb-2">시간대별 목 각도</div>
              <div className="flex items-end gap-1 h-10">
                {[60, 80, 50, 70, 45, 90, 55, 65].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm min-w-0 ${[1, 5].includes(i) ? "bg-[var(--danger-text)] opacity-60" : "bg-[var(--green-mid)] opacity-70"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-[100px] px-6 md:px-12 text-center max-w-[1100px] mx-auto">
        <h2 className="reveal font-[Nunito] text-[clamp(28px,4vw,40px)] font-black tracking-tight mb-3 leading-tight">
          3단계면 충분해요
        </h2>
        <p className="reveal text-base text-[var(--text-sub)] max-w-[520px] mx-auto mb-14 leading-[1.7]">
          복잡한 설정 없이 바로 시작할 수 있어요.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
          <div className="absolute top-10 left-[calc(16.66%+16px)] right-[calc(16.66%+16px)] h-0.5 bg-gradient-to-r from-[var(--green-border)] via-[var(--green-mid)] to-[var(--green-border)] z-0 hidden md:block" />
          {[
            { icon: "📸", title: "카메라 켜기", desc: "측정하기 버튼을 누르면\n웹캠이 자동으로 활성화돼요." },
            { icon: "🤖", title: "AI가 분석해요", desc: "MediaPipe AI가 실시간으로\n목 각도를 측정하고 기록해요." },
            { icon: "📈", title: "결과 확인", desc: "통계 탭에서 오늘의 자세 데이터를\n한눈에 확인할 수 있어요." },
          ].map((s, i) => (
            <div key={s.title} className={`reveal ${["reveal-delay-1", "reveal-delay-2", "reveal-delay-3"][i]} flex flex-col items-center py-0 px-6 relative z-10`}>
              <div className="w-20 h-20 bg-white border-2 border-[var(--green-border)] rounded-full flex items-center justify-center text-[32px] mb-5 shadow-[0_4px_20px_rgba(74,124,89,0.1)] transition-all duration-250 hover:border-[var(--green)] hover:scale-110 hover:shadow-[0_8px_28px_rgba(74,124,89,0.2)]">
                {s.icon}
              </div>
              <div className="font-[Nunito] font-extrabold text-[17px] mb-2">{s.title}</div>
              <div className="text-[13px] text-[var(--text-sub)] leading-relaxed whitespace-pre-line">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div
        id="cta"
        className="mx-6 md:mx-12 mb-[100px] rounded-[28px] py-[72px] px-6 md:px-12 text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--green-dark) 0%, var(--green) 50%, var(--green-mid) 100%)",
        }}
      >
        <h2 className="font-[Nunito] text-[clamp(28px,4vw,42px)] font-black text-white mb-3 leading-tight">
          지금 바로 시작해보세요 🐢
        </h2>
        <p className="text-base text-white/75 mb-9 leading-[1.7]">
          거북목 걱정 없는 하루를 만들어드릴게요.
          <br />
          무료로 시작할 수 있어요.
        </p>
        <button
          type="button"
          onClick={() => signIn("github")}
          className="bg-white text-[var(--green)] border-none rounded-[14px] py-[15px] px-9 text-base font-bold cursor-pointer transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:-translate-y-[3px] hover:shadow-[0_14px_36px_rgba(0,0,0,0.2)]"
          style={{ fontFamily: "inherit" }}
        >
          GitHub로 무료 시작하기
        </button>
      </div>

      {/* 푸터 - 콘텐츠 맨 아래에 배치 */}
      <footer className="w-full border-t border-[var(--green-border)] py-8 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
        <div
          className="font-[Nunito] font-extrabold text-base text-[var(--green)]"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          🐢 거북목 거북거북!
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          © 2026 거북목 거북거북! Team. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
