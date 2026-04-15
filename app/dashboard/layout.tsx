import { auth } from "@clerk/nextjs/server";
import { DashboardTabs } from "@/components/layout/dashboard-tabs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { orgRole } = await auth.protect();
  const isAdmin = orgRole === "org:admin";

  return (
    <div className="space-y-6">
      <DashboardTabs isAdmin={isAdmin} />
      {children}
    </div>
  );
}
