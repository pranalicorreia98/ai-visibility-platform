import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { AdminDashboard } from "./admin-dashboard";

export default async function AdminPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }
  if (!isAdminEmail(session.user.email)) {
    redirect("/dashboard/analysis");
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB] p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage beta access, allowlist, and user approvals.
          </p>
        </div>
        <AdminDashboard />
      </div>
    </div>
  );
}
