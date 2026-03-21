"use client";

import { useEffect } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import DashboardMockupCard from "@/components/molecules/DashboardMockupCard";
import Footer from "@/components/organisms/layout/Footer";
import TurtleLogo from "@/components/atoms/TurtleLogo";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
type FeatureI18n = {
  title: string;
  description: string;
};
type FeatureI18n_Proof = {
  num: string;
  label: string;
  source: string;
};
export default function LandingTemplate() {
  const t = useTranslations("landing");
  const router = useRouter();

  const featureTexts = t.raw("features.features") as FeatureI18n[];
  const proofTexts = t.raw("proof") as FeatureI18n_Proof[];
  const mockupTexts = t.raw("mockup.mockups") as FeatureI18n[];
  const howItWorks = t.raw("howItWorks.workLists") as FeatureI18n[];

  const icons = ["📷", "🤖", "🔔", "📊", "🔒", "💻"];
  const icons_proof = ["💻", "🐢", "⚖️"];
  const icons_howItWorks = ["📸", "🤖", "📈"];

  const FEATURES = featureTexts.map((f, i) => ({
    icon: icons[i] ?? "✨",
    title: f.title,
    description: f.description,
  }));
  const PROOF = proofTexts.map((f, i) => ({
    icon: icons_proof[i] ?? "✨",
    num: f.num,
    label: f.label,
    source: f.source,
  }));
  const MOCKUPS = mockupTexts.map((f, i) => ({
    num: i,
    title: f.title,
    description: f.description,
  }));
  const HOWITWORKS = howItWorks.map((f, i) => ({
    icon: icons_howItWorks[i] ?? "✨",
    title: f.title,
    description: f.description,
  }));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.15 },
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
              {t("hero.title.1")}
              <br />
              <span className="text-[var(--green)]">{t("hero.title.2")}</span>
            </h1>
            <p className="landing-hero-fade-up-2 text-base text-[var(--text-sub)] leading-[1.75] mb-9 font-normal">
              {t("hero.description.1")}
              <br />
              {t("hero.description.2")}
            </p>
            <div className="landing-hero-fade-up-3 flex gap-3 items-center flex-wrap">
              <Button
                size="lg"
                variant="primary"
                className="inline-flex items-center gap-2 py-3.5 px-7 rounded-[14px] text-[15px] font-bold shadow-[0_4px_16px_rgba(74,124,89,0.3)] hover:shadow-[0_8px_24px_rgba(74,124,89,0.35)] hover:-translate-y-0.5"
                onClick={() => router.push("/trial")}
              >
                {t("hero.buttons.start")}
              </Button>
              <button
                type="button"
                onClick={scrollToHow}
                className="group inline-flex items-center gap-1.5 text-[var(--text-sub)] text-sm font-semibold border-none bg-transparent cursor-pointer transition-colors hover:text-[var(--green)]"
              >
                {t("hero.buttons.howItWorks")}{" "}
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
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
          <h2
            className="reveal text-[clamp(28px,4vw,40px)] font-black text-[var(--text)] leading-tight mb-3"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            {t("problem.title.1")}
            <br />
            {t("problem.title.2")}
          </h2>
          <p className="reveal text-base text-[var(--text-sub)] mx-auto mb-12 max-w-[520px] leading-[1.7]">
            {t("problem.title.1")}
            <br />
            {t("problem.title.2")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 reveal">
            {PROOF.map((stat) => (
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
                <div className="text-xs text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                  {stat.source}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-[100px] px-6 md:px-12 text-center max-w-[1100px] mx-auto">
        <h2 className="reveal font-[Nunito] text-[clamp(28px,4vw,40px)] font-black tracking-tight mb-3 leading-tight">
          {t("features.title.1")}
          <br />
          {t("features.title.2")}
        </h2>
        <p className="reveal text-base text-[var(--text-sub)] max-w-[520px] mx-auto mb-14 leading-[1.7]">
          {t("features.description")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`reveal ${["reveal-delay-1", "reveal-delay-2", "reveal-delay-3"][i % 3]}`}>
              <Card className="rounded-[20px] p-8 text-left transition-all duration-250 hover:-translate-y-1">
                <div className="w-[52px] h-[52px] bg-[var(--green-light)] rounded-[14px] flex items-center justify-center text-[26px] mb-4">
                  {f.icon}
                </div>
                <div className="font-[Nunito] font-extrabold text-[17px] mb-2">{f.title}</div>
                <div className="text-sm text-[var(--text-sub)] leading-relaxed">{f.description}</div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* MOCKUP */}
      <section className="py-[100px] px-6 md:px-12 max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal font-[Nunito] text-[clamp(28px,4vw,40px)] font-black tracking-tight mb-3 leading-tight">
            {t("mockup.title.1")}
            <br />
            {t("mockup.title.2")}
          </h2>
          <p className="reveal text-base text-[var(--text-sub)] mb-7 max-w-[520px] leading-[1.7]">
            {t("mockup.description")}
          </p>
          <div className="reveal flex flex-col gap-4">
            {MOCKUPS.map((p) => (
              <div key={p.num} className="flex items-start gap-3.5">
                <div className="w-7 h-7 bg-[var(--green)] text-white rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 mt-0.5">
                  {p.num}
                </div>
                <div>
                  <strong className="block text-sm font-bold mb-0.5">{p.title}</strong>
                  <span className="text-[13px] text-[var(--text-sub)]">{p.description}</span>
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
          {t("howItWorks.title")}
        </h2>
        <p className="reveal text-base text-[var(--text-sub)] max-w-[520px] mx-auto mb-14 leading-[1.7]">
          {t("howItWorks.description")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
          <div className="absolute top-10 left-[calc(16.66%+16px)] right-[calc(16.66%+16px)] h-0.5 bg-gradient-to-r from-[var(--green-border)] via-[var(--green-mid)] to-[var(--green-border)] z-0 hidden md:block" />
          {HOWITWORKS.map((s, i) => (
            <div
              key={s.title}
              className={`reveal ${["reveal-delay-1", "reveal-delay-2", "reveal-delay-3"][i]} flex flex-col items-center py-0 px-6 relative z-10`}
            >
              <div className="w-20 h-20 bg-white border-2 border-[var(--green-border)] rounded-full flex items-center justify-center text-[32px] mb-5 shadow-[0_4px_20px_rgba(74,124,89,0.1)] transition-all duration-250 hover:border-[var(--green)] hover:scale-110 hover:shadow-[0_8px_28px_rgba(74,124,89,0.2)]">
                {s.icon}
              </div>
              <div className="font-[Nunito] font-extrabold text-[17px] mb-2">{s.title}</div>
              <div className="text-[13px] text-[var(--text-sub)] leading-relaxed whitespace-pre-line">
                {s.description}
              </div>
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
          {t("cta.title")} 🐢
        </h2>
        <p className="text-base text-white/75 mb-9 leading-[1.7]">{t("cta.description")}</p>
        <button
          type="button"
          onClick={() => router.push("/trial")}
          className="bg-white text-[var(--green)] border-none rounded-[14px] py-[15px] px-9 text-base font-bold cursor-pointer transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:-translate-y-[3px] hover:shadow-[0_14px_36px_rgba(0,0,0,0.2)]"
          style={{ fontFamily: "inherit" }}
        >
          {t("button")}
        </button>
      </div>
      <Footer />
    </div>
  );
}
