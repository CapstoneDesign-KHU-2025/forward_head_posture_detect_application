export default function ErrorBanner({ error }: { error: string }) {
  return (
    <div className="mt-6 p-6 bg-[#FFF9E6] rounded-xl border-l-4 border-[#F59E0B]">
      <p className="text-[#92400E] leading-relaxed">⚠️ {error}</p>
    </div>
  );
}
