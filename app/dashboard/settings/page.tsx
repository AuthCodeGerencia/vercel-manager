import { OrganizationProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization settings.
        </p>
      </div>
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
