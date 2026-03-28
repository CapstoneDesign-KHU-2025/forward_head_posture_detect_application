import { Link } from "@/i18n/navigation";

type TextLinkProps = {
  href: string;
  children: React.ReactNode;
  underline?: boolean;
  className?: string;
};

export function TextLink({ href, children, underline = false, className }: TextLinkProps) {
  return (
    <Link
      href={href}
      className={[
        "text-xs text-black/50 hover:text-black transition-colors",
        underline ? "underline underline-offset-2" : "",
        className,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
