type MetricCardProps = { title: string; description: string; source?: string };

export default function MetricCard({ title, description, source }: MetricCardProps) {
  return (
    <div className="bg-[var(--green-pale)] p-8 rounded-xl border-l-4 border-[#4A9D4D]">
      <div className="text-5xl font-bold text-[#2D5F2E] mb-2">{title}</div>
      <div className="text-lg text-[#4F4F4F] ">{description}</div>
      <div className="text-sm text-[#b1adad] mt-4">{source}</div>
    </div>
  );
}
