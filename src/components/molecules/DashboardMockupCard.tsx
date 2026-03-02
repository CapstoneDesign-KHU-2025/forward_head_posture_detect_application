import { Card } from "@/components/atoms/Card";

export default function DashboardMockupCard() {
  return (
    <Card className="reveal rounded-[24px] border border-[var(--green-border)] overflow-hidden">
      <div className="bg-[var(--green-pale)] border-b border-[var(--green-border)] py-3 px-4 flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff6b6b]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#ffd93d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#6bcb77]" />
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="bg-gradient-to-br from-[var(--green)] to-[var(--green-mid)] rounded-[14px] p-4 text-white">
          <div className="font-[Nunito] font-extrabold text-[15px] mb-1">Jimin Nam 님, 안녕하세요! 👋</div>
          <div className="text-[11px] opacity-80">오늘도 바른 자세로 하루를 시작해봐요 🐢</div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-[var(--green-pale)] border border-[var(--green-border)] rounded-xl p-3.5">
            <div className="text-[10px] text-[var(--text-muted)] mb-1">측정 시간</div>
            <div className="font-[Nunito] font-extrabold text-lg text-[var(--green)]">2h 14m</div>
          </div>
          <div className="bg-[var(--green-pale)] border border-[var(--green-border)] rounded-xl p-3.5">
            <div className="text-[10px] text-[var(--text-muted)] mb-1">오늘 경고</div>
            <div className="font-[Nunito] font-extrabold text-lg text-[var(--danger-text)]">3회</div>
          </div>
        </div>
        <div className="bg-[var(--green-pale)] border border-[var(--green-border)] rounded-xl p-3.5">
          <div className="text-[10px] text-[var(--text-muted)] mb-2">시간대별 목 각도</div>
          <div className="flex items-end gap-1 h-10">
            {[60, 80, 50, 70, 45, 90, 55, 65].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm min-w-0 ${[1, 5].includes(i) ? "bg-[var(--danger-text)] opacity-60" : "bg-[var(--green-mid)] opacity-70"}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
