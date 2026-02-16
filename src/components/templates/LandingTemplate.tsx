"use client";

import * as React from "react";
import { Button } from "@/components/atoms/Button";
import { signIn } from "next-auth/react";
import TurtleLogo from "../atoms/TurtleLogo";
import MetricCard from "../atoms/StatCard";

export default function LandingTemplate() {
  return (
    <div className="min-h-screen bg-[#F8FBF8] w-screen pt-16">
      {/* 히어로 섹션 */}
      <section className="min-h-screen bg-gradient-to-br from-[#E8F5E9] to-[#F8FBF8] flex items-center py-16 px-4">
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          @keyframes pulse {
            0%,
            100% {
              opacity: 0.2;
              transform: scale(1);
            }
            50% {
              opacity: 0.4;
              transform: scale(1.1);
            }
          }
          .hero-content {
            animation: fadeInUp 0.8s ease-out;
          }
          .hero-image {
            animation: fadeInRight 0.8s ease-out 0.2s both;
          }
          .turtle-float {
            animation: float 3s ease-in-out infinite;
          }
          .check-pulse {
            animation: pulse 2s ease-in-out infinite;
          }
        `}</style>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="hero-content">
            <h1 className="text-4xl md:text-4xl font-bold text-[#2D5F2E] mb-6 leading-normal">
              거북목, 이제
              <br />
              <span className="text-[#4A9D4D] text-6xl">AI가 관리</span>해드립니다
            </h1>
            <p className="text-xl text-[#4F4F4F] mb-8">
              웹캠 하나로 실시간 자세 측정부터 통계 관리까지.
              <br />
              건강한 자세를 위한 가장 쉬운 방법을 경험하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" className="w-full sm:w-auto" onClick={() => signIn()}>
                시작하기
              </Button>
              <a href="#features">
                <Button variant="secondary" className="w-full sm:w-auto">
                  더 알아보기
                </Button>
              </a>
            </div>
          </div>
          <TurtleLogo />
        </div>
      </section>

      {/* 문제 제기 섹션 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#2D5F2E] mb-4">
            현대인의 건강은 잦은 컴퓨터 사용으로
            <br />
            위협받고 있어요
          </h2>
          <p className="text-2xl text-[#4F4F4F] mb-12">
            어떻게 하면 업무를 하는 동안
            <br />
            올바른 자세를 유지할 수 있을까?
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <MetricCard
              title="5시간+"
              description="하루 평균 컴퓨터 사용 시간"
              source="출처 | 방송통신위원회의 스마트폰∙PC 이용 행태 조사"
            />
            <MetricCard title="70%" description="현대인 거북목 유병률" source="출처 | 질병관리청" />
            <MetricCard title="15kg+" description="잘못된 자세로 인한 목 부담" source="출처 | 질병관리청" />
          </div>
        </div>
      </section>

      {/* 솔루션 섹션 */}
      <section id="features" className="py-20 px-8 bg-[#E8F5E9]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[2.5rem] font-bold text-[#2D5F2E] text-center mb-12">
            거북목 거북거북!이 해결해드립니다
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div
              className="bg-white p-8 rounded-[12px] transition-transform duration-300 hover:-translate-y-[5px]"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
            >
              <div className="text-[3rem] mb-4">📹</div>
              <h3 className="text-[1.5rem] font-bold text-[#2D5F2E] mb-4">웹캠만 있으면 OK</h3>
              <p className="text-[#4F4F4F]" style={{ lineHeight: "1.8" }}>
                별도의 장비나 측면 카메라 없이 정면 웹캠만으로 실시간 자세 측정이 가능합니다.
              </p>
            </div>

            <div
              className="bg-white p-8 rounded-[12px] transition-transform duration-300 hover:-translate-y-[5px]"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
            >
              <div className="text-[3rem] mb-4">🤖</div>
              <h3 className="text-[1.5rem] font-bold text-[#2D5F2E] mb-4">AI 실시간 분석</h3>
              <p className="text-[#4F4F4F]" style={{ lineHeight: "1.8" }}>
                MediaPipe AI 기술로 33개 신체 랜드마크를 추적하여 정확한 거북목 판정을 제공합니다.
              </p>
            </div>

            <div
              className="bg-white p-8 rounded-[12px] transition-transform duration-300 hover:-translate-y-[5px]"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
            >
              <div className="text-[3rem] mb-4">🔔</div>
              <h3 className="text-[1.5rem] font-bold text-[#2D5F2E] mb-4">즉각적인 알림</h3>
              <p className="text-[#4F4F4F]" style={{ lineHeight: "1.8" }}>
                거북목 자세 감지 시 소리와 알림으로 즉시 알려드려 바른 자세를 유지하도록 돕습니다.
              </p>
            </div>

            <div
              className="bg-white p-8 rounded-[12px] transition-transform duration-300 hover:-translate-y-[5px]"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
            >
              <div className="text-[3rem] mb-4">📊</div>
              <h3 className="text-[1.5rem] font-bold text-[#2D5F2E] mb-4">통계 기반 관리</h3>
              <p className="text-[#4F4F4F]" style={{ lineHeight: "1.8" }}>
                매일, 매주 평균 목 각도를 분석하여 자세 변화 추이를 한눈에 확인할 수 있습니다.
              </p>
            </div>

            <div
              className="bg-white p-8 rounded-[12px] transition-transform duration-300 hover:-translate-y-[5px]"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
            >
              <div className="text-[3rem] mb-4">🔒</div>
              <h3 className="text-[1.5rem] font-bold text-[#2D5F2E] mb-4">개인정보 보호</h3>
              <p className="text-[#4F4F4F]" style={{ lineHeight: "1.8" }}>
                클라이언트 사이드 AI 처리로 영상 데이터가 서버로 전송되지 않아 안전합니다.
              </p>
            </div>

            <div
              className="bg-white p-8 rounded-[12px] transition-transform duration-300 hover:-translate-y-[5px]"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
            >
              <div className="text-[3rem] mb-4">💻</div>
              <h3 className="text-[1.5rem] font-bold text-[#2D5F2E] mb-4">플랫폼 독립적</h3>
              <p className="text-[#4F4F4F]" style={{ lineHeight: "1.8" }}>
                브라우저만 있으면 언제 어디서나 사용 가능한 웹 기반 솔루션입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#2D5F2E] to-[#4A9D4D] text-white text-center">
        <h2 className="text-4xl font-bold mb-4">지금 바로 시작하세요</h2>
        <p className="text-xl mb-8 opacity-90">GitHub 또는 Google 계정으로 바로 시작할 수 있습니다</p>
        <Button className="bg-white !text-[#2D5F2E] hover:bg-[#F8FBF8] font-bold" onClick={() => signIn()}>
          시작하기
        </Button>
      </section>
    </div>
  );
}
