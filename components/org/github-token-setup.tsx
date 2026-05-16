"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveGithubTokenAction } from "@/lib/actions";

interface GithubTokenSetupProps {
  hasToken: boolean;
}

export function GithubTokenSetup({ hasToken }: GithubTokenSetupProps) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    try {
      await saveGithubTokenAction(token.trim());
      setToken("");
      toast.success("GitHub token saved");
    } catch {
      toast.error("Failed to save token. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub Token</CardTitle>
        <CardDescription>
          {hasToken
            ? "A GitHub token is configured. Replace it below if needed."
            : "Required to trigger deployments via empty commits. Needs repo write access."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={hasToken ? "Replace existing token..." : "ghp_..."}
            className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
          <Button type="submit" size="sm" disabled={loading || !token.trim()}>
            {loading ? "Saving..." : hasToken ? "Update" : "Save"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
