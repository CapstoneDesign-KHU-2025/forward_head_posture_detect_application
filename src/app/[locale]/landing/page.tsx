import LandingTemplate from "./components/LandingTemplate";
import { redirect } from "@/i18n/navigation";
import { auth } from "@/auth";
import { getLocale } from "next-intl/server";

export default async function LandingPage() {
  const locale = await getLocale();
  const session = await auth();
  if (session?.user) {
    return redirect({ href: "/", locale });
  }
  return <LandingTemplate />;
}
