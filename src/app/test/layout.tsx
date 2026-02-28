import { auth } from "@/auth";
import { redirect } from "next/navigation";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

type TestLayoutProps = {
  children: React.ReactNode;
};

export default async function TestLayout({ children }: TestLayoutProps) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const isAdmin = ADMIN_EMAILS.includes(session.user.email);

  if (!isAdmin) {
    redirect("/");
  }

  return <>{children}</>;
}

