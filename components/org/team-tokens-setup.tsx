"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  deleteTeamTokenAction,
  saveTeamTokenAction,
  type TeamTokens,
} from "@/lib/actions";
import { useRouter } from "next/navigation";

interface TeamTokensSetupProps {
  teamTokens: TeamTokens;
}

export function TeamTokensSetup({ teamTokens }: TeamTokensSetupProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"github" | "vercel">("github");
  const [token, setToken] = useState("");

  const entries = Object.entries(teamTokens);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!slug.trim() || !token.trim()) return;
    startTransition(async () => {
      try {
        await saveTeamTokenAction(slug.trim(), type, token.trim());
        setSlug("");
        setToken("");
        toast.success(`Token saved for "${slug.trim()}"`);
        router.refresh();
      } catch {
        toast.error("Failed to save token.");
      }
    });
  }

  function handleDelete(teamSlug: string, tokenType: "github" | "vercel") {
    startTransition(async () => {
      try {
        await deleteTeamTokenAction(teamSlug, tokenType);
        toast.success(`Token removed for "${teamSlug}"`);
        router.refresh();
      } catch {
        toast.error("Failed to remove token.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team-specific Tokens</CardTitle>
        <CardDescription>
          Configure GitHub or Vercel tokens for specific GitHub organizations
          or teams. Used when the default token lacks access to that org's repos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.length > 0 && (
          <ul className="space-y-2">
            {entries.map(([teamSlug, tokens]) => (
              <li key={teamSlug} className="rounded-md border px-3 py-2 space-y-1">
                <p className="text-sm font-medium">{teamSlug}</p>
                <div className="flex flex-wrap gap-2">
                  {tokens.githubToken && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                        GitHub token configured
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-xs text-destructive hover:text-destructive"
                        disabled={isPending}
                        onClick={() => handleDelete(teamSlug, "github")}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  {tokens.vercelToken && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                        Vercel token configured
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-xs text-destructive hover:text-destructive"
                        disabled={isPending}
                        onClick={() => handleDelete(teamSlug, "vercel")}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="GitHub org / team slug (e.g. authcodela)"
              className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "github" | "vercel")}
              className="flex h-9 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="github">GitHub</option>
              <option value="vercel">Vercel</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={type === "github" ? "ghp_..." : "Vercel token..."}
              className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !slug.trim() || !token.trim()}
            >
              {isPending ? "Saving..." : "Add"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
