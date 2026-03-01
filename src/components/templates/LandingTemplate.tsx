"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import DashboardMockupCard from "@/components/molecules/DashboardMockupCard";
import TurtleLogo from "@/components/atoms/TurtleLogo";

const FEATURES = [
  {
    icon: "📷",
    title: "웹캠만 있으면 OK",
    desc: "별도의 장비나 측면 카메라 없이 정면 웹캠만으로 실시간 자세 측정이 가능합니다.",
  },
  {
    icon: "🤖",
    title: "AI 실시간 분석",
    desc: "MediaPipe AI 기술로 33개 신체 랜드마크를 추적하여 정확한 거북목 판정을 제공합니다.",
  },
  {
    icon: "🔔",
    title: "통계 기반 관리",
    desc: "거북목 자세 감지 시 소리와 알림으로 즉시 알려드려 바른 자세를 유지하도록 돕습니다.",
  },
  {
    icon: "📊",
    title: "즉각적인 알림",
    desc: "매일, 매주 평균 목 각도를 분석하여 자세 변화 추이를 한눈에 확인할 수 있습니다.",
  },
  {
    icon: "🔒",
    title: "개인정보 보호",
    desc: "클라이언트 사이드 AI 처리로 영상 데이터가 서버로 전송되지 않아 안전합니다.",
  },
  {
    icon: "💻",
    title: "플랫폼 독립적",
    desc: "브라우저만 있으면 언제 어디서나 사용 가능한 웹 기반 솔루션입니다.",
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
                시작하기
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
            <div
              key={f.title}
              className={`reveal ${["reveal-delay-1", "reveal-delay-2", "reveal-delay-3"][i % 3]}`}
            >
              <Card className="rounded-[20px] p-8 text-left transition-all duration-250 hover:-translate-y-1">
                <div className="w-[52px] h-[52px] bg-[var(--green-light)] rounded-[14px] flex items-center justify-center text-[26px] mb-4">
                  {f.icon}
                </div>
                <div className="font-[Nunito] font-extrabold text-[17px] mb-2">{f.title}</div>
                <div className="text-sm text-[var(--text-sub)] leading-relaxed">{f.desc}</div>
              </Card>
            </div>
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

        <DashboardMockupCard />
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
        </p>
        <button
          type="button"
          onClick={() => signIn("github")}
          className="bg-white text-[var(--green)] border-none rounded-[14px] py-[15px] px-9 text-base font-bold cursor-pointer transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:-translate-y-[3px] hover:shadow-[0_14px_36px_rgba(0,0,0,0.2)]"
          style={{ fontFamily: "inherit" }}
        >
          시작하기
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
