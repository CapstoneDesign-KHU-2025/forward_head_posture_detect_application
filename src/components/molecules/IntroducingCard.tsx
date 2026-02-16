type IntroducingProps = {
  icon: string;
  title: string;
  description: string;
};

export default function IntroducingCard({ icon, title, description }: IntroducingProps) {
  return (
    <div
      className="bg-white p-8 rounded-[12px] transition-transform duration-300 hover:-translate-y-[5px]"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
    >
      <div className="text-[3rem] mb-4">{icon}</div>
      <h3 className="text-[1.5rem] font-bold text-[#2D5F2E] mb-4">{title}</h3>
      <p className="text-[#4F4F4F]" style={{ lineHeight: "1.8" }}>
        {description}
      </p>
    </div>
  );
}
