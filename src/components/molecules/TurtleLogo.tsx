import { Icon } from "@/components/atoms/Icon";

type IconSize = "xl" | "2xl";

const SIZE_MAP = {
  s: {
    image: "w-10 h-10",
  },
  m: {
    image: "w-14 h-14",
  },
} as const;

type TurtleLogoProps =
  | { size: "s" | "m"; iconSize?: never }
  | { size?: never; iconSize: IconSize };

export default function TurtleLogo({ size, iconSize }: TurtleLogoProps) {
  if (iconSize) {
    return (
      <Icon size={iconSize}>
        <img src="/icons/turtle.png" alt="거북이" className="object-contain shrink-0" />
      </Icon>
    );
  }
  const styles = SIZE_MAP[size ?? "s"];
  return (
    <img src="/icons/turtle.png" alt="거북이" className={`${styles.image} object-contain shrink-0`} />
  );
}
