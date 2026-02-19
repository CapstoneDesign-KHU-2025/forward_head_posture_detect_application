import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <html lang="ko">
      <body className="min-h-dvh bg-neutral-50 text-black antialiased">{children}</body>
    </html>
  );
}