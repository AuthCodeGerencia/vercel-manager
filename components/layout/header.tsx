import Link from "next/link";
import { TriangleIcon } from "lucide-react";

export function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <TriangleIcon className="h-5 w-5 fill-current" />
          Vercel Manager
        </Link>
        <div className="flex items-center gap-3">{children}</div>
      </div>
    </header>
  );
}
