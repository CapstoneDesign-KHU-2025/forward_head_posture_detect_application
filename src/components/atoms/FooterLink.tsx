import Link from "next/link";

type FooterLinkProps = {
  href: string;
  children: React.ReactNode;
  underline?: boolean;
  className?: string;
};

export function FooterLink({ href, children, underline = false, className }: FooterLinkProps) {
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
