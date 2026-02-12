"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveVercelToken } from "@/lib/actions";

export function TokenSetup() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await saveVercelToken(token.trim());
      router.refresh();
    } catch {
      setError("Failed to save token. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect Vercel</CardTitle>
          <CardDescription>
            Enter your Vercel API token to manage projects for this organization.
            You can create a token at{" "}
            <a
              href="https://vercel.com/account/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-foreground"
            >
              vercel.com/account/tokens
            </a>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="vercel-token" className="text-sm font-medium">
                API Token
              </label>
              <input
                id="vercel-token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your Vercel API token"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !token.trim()}>
              {loading ? "Saving..." : "Save Token"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
