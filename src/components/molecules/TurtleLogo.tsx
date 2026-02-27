const SIZE_MAP = {
  s: {
    wrapper: "w-10 h-10",
    image: "w-6 h-6",
  },
  m: {
    wrapper: "w-20 h-20",
    image: "w-12 h-12",
  },
} as const;

export default function TurtleLogo({ size }: { size: "s" | "m" }) {
  const styles = SIZE_MAP[size];

  return (
    <div className={`${styles.wrapper} rounded-full flex items-center justify-center bg-[#E8F5E9]`}>
      <img src="/icons/turtle.png" alt="거북이" className={`${styles.image} object-contain`} />
    </div>
  );
}
