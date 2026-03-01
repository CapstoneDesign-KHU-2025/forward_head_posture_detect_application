import { auth } from "@/auth";
import { redirect } from "@/navigation";
import { Props } from "../layout";

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect({ href: "/login", locale: locale });

  return <>{children}</>;
}
