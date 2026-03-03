import LandingTemplate from "@/components/templates/LandingTemplate";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    return redirect("/");
  }
  return <LandingTemplate />;
}
