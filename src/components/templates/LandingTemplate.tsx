"use client";

import * as React from "react";
import { Button } from "@/components/atoms/button/Button";
import { signIn } from "next-auth/react";

export default function LandingTemplate() {
  return (
    <div className="min-h-screen bg-[#F8FBF8] w-screen pt-16">
      {/* 히어로 섹션 */}
      <section className="min-h-screen bg-gradient-to-br from-[#E8F5E9] to-[#F8FBF8] flex items-center py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="hero-content">
            <h1 className="text-5xl md:text-6xl font-bold text-[#2D5F2E] mb-6 leading-tight">
              거북목, 이제<br />
              <span className="text-[#4A9D4D]">AI가 관리</span>해드립니다
            </h1>
            <p className="text-xl text-[#4F4F4F] mb-8">
              웹캠 하나로 실시간 자세 측정부터 통계 관리까지.<br />
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
          <div className="hero-image bg-white rounded-3xl p-8 shadow-xl text-center">
            <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md mx-auto">
              {/* 거북이 등껍질 */}
              <ellipse cx="200" cy="180" rx="100" ry="80" fill="#4A9D4D" />
              <ellipse cx="200" cy="180" rx="85" ry="65" fill="#66BB6A" />
              
              {/* 등껍질 패턴 */}
              <circle cx="200" cy="150" r="18" fill="#4A9D4D" opacity="0.5" />
              <circle cx="175" cy="175" r="15" fill="#4A9D4D" opacity="0.5" />
              <circle cx="225" cy="175" r="15" fill="#4A9D4D" opacity="0.5" />
              <circle cx="200" cy="190" r="18" fill="#4A9D4D" opacity="0.5" />
              <circle cx="180" cy="210" r="13" fill="#4A9D4D" opacity="0.5" />
              <circle cx="220" cy="210" r="13" fill="#4A9D4D" opacity="0.5" />
              
              {/* 목 */}
              <ellipse cx="150" cy="150" rx="25" ry="40" fill="#7BC67E" transform="rotate(-20 150 150)" />
              
              {/* 머리 */}
              <ellipse cx="120" cy="120" rx="32" ry="35" fill="#7BC67E" />
              
              {/* 눈 */}
              <circle cx="112" cy="115" r="6" fill="#2D5F2E" />
              <circle cx="114" cy="113" r="2.5" fill="white" />
              
              {/* 미소 */}
              <path d="M 105 130 Q 120 135 130 132" stroke="#2D5F2E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              
              {/* 발 */}
              <ellipse cx="250" cy="220" rx="20" ry="25" fill="#7BC67E" />
              <ellipse cx="260" cy="245" rx="23" ry="18" fill="#7BC67E" />
              <ellipse cx="150" cy="225" rx="18" ry="25" fill="#7BC67E" />
              <ellipse cx="145" cy="245" rx="22" ry="15" fill="#7BC67E" />
              
              {/* 꼬리 */}
              <ellipse cx="280" cy="190" rx="15" ry="12" fill="#7BC67E" />
              
              {/* 체크 아이콘 (건강함) */}
              <circle cx="320" cy="100" r="35" fill="#4A9D4D" opacity="0.2" />
              <path d="M 305 100 L 315 110 L 335 85" stroke="#4A9D4D" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* 문제 제기 섹션 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#2D5F2E] mb-4">
            현대인의 건강은 잦은 컴퓨터 사용으로<br />
            위협받고 있어요
          </h2>
          <p className="text-2xl text-[#4F4F4F] mb-12">
            어떻게 하면 업무를 하는 동안<br />
            올바른 자세를 유지할 수 있을까?
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-[#F8FBF8] p-8 rounded-xl border-l-4 border-[#4A9D4D]">
              <div className="text-5xl font-bold text-[#2D5F2E] mb-2">8시간+</div>
              <div className="text-lg text-[#4F4F4F]">하루 평균 컴퓨터 사용 시간</div>
            </div>
            <div className="bg-[#F8FBF8] p-8 rounded-xl border-l-4 border-[#4A9D4D]">
              <div className="text-5xl font-bold text-[#2D5F2E] mb-2">70%</div>
              <div className="text-lg text-[#4F4F4F]">직장인 거북목 유병률</div>
            </div>
            <div className="bg-[#F8FBF8] p-8 rounded-xl border-l-4 border-[#4A9D4D]">
              <div className="text-5xl font-bold text-[#2D5F2E] mb-2">15kg</div>
              <div className="text-lg text-[#4F4F4F]">잘못된 자세로 인한 목 부담</div>
            </div>
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
        <p className="text-xl mb-8 opacity-90">
          GitHub 또는 Google 계정으로 바로 시작할 수 있습니다
        </p>
        <Button
          className="bg-white !text-[#2D5F2E] hover:bg-[#F8FBF8] font-bold"
          onClick={() => signIn()}
        >
          시작하기
        </Button>
      </section>
    </div>
  );
}

