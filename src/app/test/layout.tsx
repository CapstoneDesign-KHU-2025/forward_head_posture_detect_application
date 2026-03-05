import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

type TestLayoutProps = {
  children: React.ReactNode;
};

export default async function TestLayout({ children }: TestLayoutProps) {
  const session = await auth();
  const locale = await getLocale();

  const email = session?.user?.email;
  if (!email) {
    return redirect({ href: "/login", locale });
  }

  const isAdmin = ADMIN_EMAILS.includes(email);

  if (isAdmin) {
    redirect({ href: "/", locale });
  }

  return <>{children}</>;
}
