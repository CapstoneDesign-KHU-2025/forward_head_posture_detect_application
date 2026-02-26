const SIZE_MAP = {
  s: {
    image: "w-10 h-10",
  },
  m: {
    image: "w-14 h-14",
  },
} as const;

export default function TurtleLogo({ size }: { size: "s" | "m" }) {
  const styles = SIZE_MAP[size];

  return (
    <img src="/icons/turtle.png" alt="거북이" className={`${styles.image} object-contain shrink-0`} />
  );
}
