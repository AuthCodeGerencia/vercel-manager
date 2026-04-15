"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const baseTabs = [
  { label: "Projects", href: "/dashboard" },
  { label: "Settings", href: "/dashboard/settings" },
];

const adminTabs = [
  { label: "Projects", href: "/dashboard" },
  { label: "Team", href: "/dashboard/team" },
  { label: "Settings", href: "/dashboard/settings" },
];

export function DashboardTabs({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const tabs = isAdmin ? adminTabs : baseTabs;

  return (
    <nav className="flex gap-1 border-b">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/dashboard"
            ? pathname === "/dashboard" || pathname.startsWith("/dashboard/projects")
            : tab.href === "/dashboard/team"
            ? pathname.startsWith("/dashboard/team")
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors",
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
