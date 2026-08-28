import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Redirect to AI Visibility (analysis) page - the main page of the app
  redirect("/dashboard/analysis");
}
