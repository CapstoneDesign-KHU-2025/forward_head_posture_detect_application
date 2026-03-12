import React from "react";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">서비스 이용약관</h1>

        <p className="text-gray-600 mb-8 text-sm">시행일자: 2026년 3월 12일</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">1. 목적</h2>
          <p className="text-gray-600 leading-relaxed">
            본 약관은 '거북거북 거북목' 서비스(이하 '서비스')의 이용 조건, 권리, 의무 및 책임 사항을 규정함을 목적으로
            합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">2. 서비스의 내용 및 변경</h2>
          <p className="text-gray-600 leading-relaxed">
            본 서비스는 기기의 카메라를 활용하여 사용자의 자세를 실시간으로 분석하고 거북목 여부를 판별하여 피드백을
            제공하는 기능을 포함합니다. 서비스의 기능은 성능 개선이나 운영상의 필요에 따라 사전 공지 없이 변경되거나
            중단될 수 있습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">3. 의료적 조언에 대한 면책 (중요)</h2>
          <p className="text-gray-600 mb-3">
            본 서비스에서 제공하는 자세 분석 및 피드백은 AI 모델(Pose Estimation)에 기반한 참고용 정보입니다.
          </p>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>
              <strong>비의료 기기:</strong> 본 서비스는 전문적인 의학적 진단, 예방, 치료를 목적으로 하는 의료 기기가
              아닙니다.
            </li>
            <li>
              <strong>전문의 상담:</strong> 자세로 인한 통증이나 건강상의 문제가 발생할 경우, 서비스 결과에 의존하지
              말고 반드시 전문 의료진과 상담해야 합니다.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">4. 사용자의 의무</h2>
          <p className="text-gray-600 leading-relaxed">
            사용자는 타인의 이메일 등 개인정보를 도용하여 서비스를 이용해서는 안 되며, 서비스 이용 과정에서 타인의
            초상권을 침해하는 방식으로 카메라 기능을 사용해서는 안 됩니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">5. 책임 제한</h2>
          <p className="text-gray-600 leading-relaxed">
            본 서비스는 무료로 제공되며, AI 모델의 분석 결과에 대해 100% 정확성을 보증하지 않습니다. 서비스 이용으로
            인해 발생하는 직·간접적인 손해나 데이터 손실에 대해서는 법적으로 허용되는 최대 한도 내에서 책임을 지지
            않습니다.
          </p>
        </section>
      </div>
    </main>
  );
}
