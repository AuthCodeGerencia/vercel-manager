import { OrganizationProfile } from "@clerk/nextjs";
import { hasGithubToken } from "@/lib/org";
import { GithubTokenSetup } from "@/components/org/github-token-setup";

export default async function SettingsPage() {
  const githubTokenSet = await hasGithubToken();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization settings.
        </p>
      </div>
      <GithubTokenSetup hasToken={githubTokenSet} />
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
