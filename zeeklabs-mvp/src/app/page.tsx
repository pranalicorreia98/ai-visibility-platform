import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";

export default async function Home() {
  const session = await getAuthSession();

  if (session) {
    redirect("/dashboard/analysis");
  } else {
    redirect("/login");
  }
}
