"use client";

import { Button } from "@/components/atoms/Button";
import { signIn } from "next-auth/react";
import TurtleLogo from "../atoms/TurtleLogo";
import MetricCard from "../atoms/MetricCard";
import IntroducingCard from "../molecules/IntroducingCard";
import { useTranslations } from "next-intl";

export default function LandingTemplate() {
  const t = useTranslations("Landing");

  const introducingCards = [
    {
      id: 1,
      icon: "📹",
      title: t("features.items.webcam.title"),
      description: t("features.items.webcam.desc"),
    },
    {
      id: 2,
      icon: "🤖",
      title: t("features.items.ai.title"),
      description: t("features.items.ai.desc"),
    },
    {
      id: 3,
      icon: "🔔",
      title: t("features.items.stats.title"),
      description: t("features.items.stats.desc"),
    },
    {
      id: 4,
      icon: "📊",
      title: t("features.items.alert.title"),
      description: t("features.items.alert.desc"),
    },
    {
      id: 5,
      icon: "🔒",
      title: t("features.items.privacy.title"),
      description: t("features.items.privacy.desc"),
    },
    {
      id: 6,
      icon: "💻",
      title: t("features.items.platform.title"),
      description: t("features.items.platform.desc"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FBF8] w-screen pt-16">
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-[#E8F5E9] to-[#F8FBF8] flex items-center py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="hero-content">
            <h1 className="text-4xl md:text-4xl font-bold text-[#2D5F2E] mb-6 leading-normal">
              {t("hero.title_line1")}
              <br />
              <span className="text-[#4A9D4D] text-6xl">{t("hero.title_highlight")}</span>
              {t("hero.title_line2")}
            </h1>
            <p className="text-xl text-[#4F4F4F] mb-8 whitespace-pre-line">{t("hero.description")}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="primary" className="w-full sm:w-auto" onClick={() => signIn()}>
                {t("hero.buttons.start")}
              </Button>
              <a href="#features">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  {t("hero.buttons.more")}
                </Button>
              </a>
            </div>
          </div>
          <TurtleLogo />
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#2D5F2E] mb-4 leading-13 whitespace-pre-line">
            {t("problem.title")}
          </h2>
          <p className="text-2xl text-[#4F4F4F] mb-12 whitespace-pre-line">{t("problem.question")}</p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <MetricCard
              title={t("problem.metrics.usage.title")}
              description={t("problem.metrics.usage.desc")}
              source={t("problem.metrics.usage.source")}
            />
            <MetricCard
              title={t("problem.metrics.prevalence.title")}
              description={t("problem.metrics.prevalence.desc")}
              source={t("problem.metrics.prevalence.source")}
            />
            <MetricCard
              title={t("problem.metrics.burden.title")}
              description={t("problem.metrics.burden.desc")}
              source={t("problem.metrics.burden.source")}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-8 bg-[#E8F5E9]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[2.5rem] font-bold text-[#2D5F2E] text-center mb-12">{t("features.title")}</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {introducingCards.map((card) => (
              <IntroducingCard icon={card.icon} title={card.title} description={card.description} key={card.id} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#2D5F2E] to-[#4A9D4D] text-white text-center">
        <h2 className="text-4xl font-bold mb-4">{t("cta.title")}</h2>
        <p className="text-xl mb-8 opacity-90">{t("cta.description")}</p>
        <Button size="lg" className="bg-white !text-[#2D5F2E] hover:bg-[#F8FBF8] font-bold" onClick={() => signIn()}>
          {t("cta.button")}
        </Button>
      </section>
    </div>
  );
}
