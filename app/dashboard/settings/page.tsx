import { OrganizationProfile } from "@clerk/nextjs";
import { hasGithubToken } from "@/lib/org";
import { GithubTokenSetup } from "@/components/org/github-token-setup";
import { TeamTokensSetup } from "@/components/org/team-tokens-setup";
import { getTeamTokensAction } from "@/lib/actions";

export default async function SettingsPage() {
  const [githubTokenSet, teamTokens] = await Promise.all([
    hasGithubToken(),
    getTeamTokensAction(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization settings.
        </p>
      </div>
      <GithubTokenSetup hasToken={githubTokenSet} />
      <TeamTokensSetup teamTokens={teamTokens} />
      <OrganizationProfile
        routing="hash"
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none",
            card: "w-full shadow-none",
          },
        }}
      />
    </div>
  );
}
