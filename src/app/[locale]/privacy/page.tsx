export default function PrivacyPolicyPage() {
  return (
    <main className="bg-gray-50 py-16 px-6 sm:px-12 lg:px-24 mb-5">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>

        <p className="text-gray-600 mb-8 text-sm">시행일자: 2026년 3월 12일</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">1. 수집하는 개인정보 항목</h2>
          <p className="text-gray-600 mb-3">
            본 서비스는 원활한 서비스 제공을 위해 아래와 같은 최소한의 개인정보를 수집하고 있습니다.
          </p>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>
              <strong>Google 로그인 시:</strong> 이메일 주소, 이름, 프로필 사진 (OAuth 인증 및 회원 식별 용도)
            </li>
            <li>
              <strong>서비스 이용 시:</strong> 서비스 이용 기록, 접속 로그
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">2. 카메라 및 영상 데이터 처리 (중요)</h2>
          <p className="text-gray-600 mb-3">
            본 서비스는 사용자의 실시간 거북목 자세 감지 및 각도 측정을 위해 기기의 카메라 접근 권한을 요청합니다. 이에
            대한 데이터 처리 방침은 다음과 같습니다.
          </p>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>
              <strong>로컬 처리:</strong> 카메라를 통해 입력된 영상 데이터는 오직 사용자의 브라우저(로컬 환경) 내에서만
              실시간으로 분석됩니다.
            </li>
            <li>
              <strong>비저장 원칙:</strong> 영상 데이터는 어떠한 경우에도 외부 서버(DB)로 전송되거나 저장되지 않습니다.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">3. 개인정보의 이용 목적</h2>
          <p className="text-gray-600">
            수집된 개인정보는 사용자의 계정 관리(NeonDB 연동 등), 맞춤형 서비스 제공, 서비스 불만 및 민원 처리, 그리고
            신규 기능 개발을 위한 통계적 분석 목적으로만 활용됩니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">4. 개인정보의 파기</h2>
          <p className="text-gray-600">
            사용자가 회원 탈퇴를 요청하거나 개인정보 수집 및 이용 목적이 달성된 경우, 해당 정보는 지체 없이 파기됩니다.
            데이터베이스에 저장된 계정 정보는 복구 불가능한 방법으로 영구 삭제됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">5. 문의처</h2>
          <p className="text-gray-600">
            개인정보처리방침과 관련된 문의사항이 있으신 경우, 아래 이메일로 연락해 주시기 바랍니다.
            <br />
            <a href="mailto:your-email@example.com" className="text-blue-600 hover:underline mt-2 inline-block">
              kge0211114@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
