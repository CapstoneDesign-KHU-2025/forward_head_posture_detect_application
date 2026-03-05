import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { Props } from "../layout";

export default async function Layout({ children, params }: Props) {
  const { locale } = params;
  const session = await auth();
  if (!session) redirect({ href: "/login", locale: locale });

  return <>{children}</>;
}
