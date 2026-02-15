export default function LoadingSkeleton() {
  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center bg-[#2C3E50] text-white rounded-[20px]"
      style={{ aspectRatio: "4/3" }}
    >
      {/* 뱅글뱅글 도는 스피너 */}
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-[#4A9D4D] mb-6"></div>
      
      {/* 텍스트 */}
      <div className="flex flex-col items-center">
        <p className="text-lg font-bold">🤖 AI 모델 로딩 중...</p>
        <p className="text-sm text-gray-400 mt-2">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}