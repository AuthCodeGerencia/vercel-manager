import { auth } from "@clerk/nextjs/server";
import { DashboardTabs } from "@/components/layout/dashboard-tabs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth.protect();

  return (
    <div className="space-y-6">
      <DashboardTabs />
      {children}
    </div>
  );
}
