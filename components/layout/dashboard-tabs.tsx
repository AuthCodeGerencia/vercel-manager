"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Projects", href: "/dashboard" },
  { label: "Settings", href: "/dashboard/settings" },
];

export function DashboardTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/dashboard"
            ? pathname === "/dashboard" || pathname.startsWith("/dashboard/projects")
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
