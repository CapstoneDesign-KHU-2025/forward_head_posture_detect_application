export default function TurtleLogo() {
  return (
    <div className="hero-image bg-white rounded-3xl p-8 shadow-xl text-center">
      {" "}
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
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md mx-auto turtle-float">
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
        <g className="check-pulse">
          <circle cx="320" cy="100" r="35" fill="#4A9D4D" opacity="0.2" />
          <path
            d="M 305 100 L 315 110 L 335 85"
            stroke="#4A9D4D"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}
