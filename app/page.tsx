import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { TriangleIcon } from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24">
      <TriangleIcon className="h-12 w-12 fill-current" />
      <h1 className="text-4xl font-bold tracking-tight">Vercel Manager</h1>
      <p className="text-lg text-muted-foreground text-center max-w-md">
        Manage your Vercel projects and deployments from a single dashboard.
      </p>
      <SignInButton>
        <Button size="lg">Sign in to get started</Button>
      </SignInButton>
    </div>
  );
}
