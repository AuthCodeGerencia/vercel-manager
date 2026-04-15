"use client";

import { useState, useTransition } from "react";
import { PlusIcon, Trash2Icon, ShieldCheckIcon, ShieldAlertIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DomainDialog } from "./domain-dialog";
import { removeProjectDomainAction, verifyProjectDomainAction } from "@/lib/actions";
import { toast } from "sonner";

interface Verification {
  type: string;
  domain: string;
  value: string;
  reason: string;
}

interface DomainConfig {
  configuredBy: string | null;
  misconfigured: boolean;
  recommendedIPv4: Array<{ rank: number; value: string[] }>;
  recommendedCNAME: Array<{ rank: number; value: string }>;
}

interface Domain {
  name: string;
  apexName: string;
  verified: boolean;
  redirect: string | null;
  gitBranch: string | null;
  createdAt: number | null;
  verification: Verification[];
  config: DomainConfig | null;
}

export function DomainList({
  projectId,
  initialDomains,
}: {
  projectId: string;
  initialDomains: Domain[];
}) {
  const [domains, setDomains] = useState<Domain[]>(initialDomains);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Domain | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();

  function handleAdded(domain: { name: string; verified: boolean; verification: Verification[] }) {
    setDomains((prev) => [
      {
        name: domain.name,
        apexName: domain.name.split(".").slice(-2).join("."),
        verified: domain.verified,
        redirect: null,
        gitBranch: null,
        createdAt: Date.now(),
        verification: domain.verification,
        config: null,
      },
      ...prev,
    ]);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startDeleteTransition(async () => {
      try {
        await removeProjectDomainAction(projectId, target.name);
        setDomains((prev) => prev.filter((d) => d.name !== target.name));
        toast.success(`${target.name} removed`);
        setDeleteTarget(null);
      } catch (err) {
        toast.error("Failed to remove domain", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  function handleVerify(domain: Domain) {
    setVerifying(domain.name);
    startTransition(async () => {
      try {
        const result = await verifyProjectDomainAction(projectId, domain.name);
        if (result.verified) {
          setDomains((prev) =>
            prev.map((d) =>
              d.name === domain.name ? { ...d, verified: true, verification: [] } : d
            )
          );
          toast.success(`${domain.name} verified`);
        } else {
          toast.error("Verification failed", {
            description: "DNS records may not have propagated yet. Try again in a few minutes.",
          });
        }
      } catch (err) {
        toast.error("Verification check failed", {
          description: err instanceof Error ? err.message : undefined,
        });
      } finally {
        setVerifying(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Domains</h2>
          <p className="text-sm text-muted-foreground">
            {domains.length} domain{domains.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <PlusIcon className="mr-1.5 h-4 w-4" />
          Add Domain
        </Button>
      </div>

      {domains.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No domains added yet. Add one to get started.
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Git Branch</TableHead>
                <TableHead>Redirect</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <>
                  <TableRow key={domain.name} className="group">
                    <TableCell className="font-mono text-sm font-medium">
                      {domain.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {domain.gitBranch ?? <span className="text-muted-foreground/50">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {domain.redirect ?? <span className="text-muted-foreground/50">—</span>}
                    </TableCell>
                    <TableCell>
                      {!domain.verified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                          <ShieldAlertIcon className="h-3.5 w-3.5" />
                          Unverified
                        </span>
                      ) : domain.config?.misconfigured ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                          <ShieldAlertIcon className="h-3.5 w-3.5" />
                          Not Configured
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <ShieldCheckIcon className="h-3.5 w-3.5" />
                          Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        {(!domain.verified || domain.config?.misconfigured) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleVerify(domain)}
                            disabled={verifying === domain.name}
                            title="Re-check verification"
                          >
                            <RefreshCwIcon className={`h-3.5 w-3.5 ${verifying === domain.name ? "animate-spin" : ""}`} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(domain)}
                          disabled={isPendingDelete}
                          title="Remove domain"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {(!domain.verified || domain.config?.misconfigured) && (
                    <TableRow key={`${domain.name}-records`} className="bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
                      <TableCell colSpan={5} className="py-3 px-4">
                        <div className="space-y-3">

                          {/* DNS pointing records */}
                          {domain.config && (domain.config.misconfigured || !domain.config.configuredBy) && (() => {
                            const isApex = domain.name === domain.apexName;
                            const cname = domain.config.recommendedCNAME[0];
                            const ipv4 = domain.config.recommendedIPv4[0];
                            const subdomain = domain.name.replace(`.${domain.apexName}`, "");
                            return (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                  Point this domain to Vercel by adding the following DNS record:
                                </p>
                                <div className="grid gap-2">
                                  {!isApex && cname && (
                                    <div className="grid grid-cols-[3rem_1fr] gap-x-6 gap-y-1 rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-mono">
                                      <span className="text-muted-foreground not-italic font-sans font-medium">Type</span>
                                      <span>CNAME</span>
                                      <span className="text-muted-foreground not-italic font-sans font-medium">Name</span>
                                      <span>{subdomain || "@"}</span>
                                      <span className="text-muted-foreground not-italic font-sans font-medium">Value</span>
                                      <span className="break-all">{cname.value}</span>
                                    </div>
                                  )}
                                  {isApex && ipv4 && (
                                    <div className="grid grid-cols-[3rem_1fr] gap-x-6 gap-y-1 rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-mono">
                                      <span className="text-muted-foreground not-italic font-sans font-medium">Type</span>
                                      <span>A</span>
                                      <span className="text-muted-foreground not-italic font-sans font-medium">Name</span>
                                      <span>@</span>
                                      <span className="text-muted-foreground not-italic font-sans font-medium">Value</span>
                                      <span>{ipv4.value[0]}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Ownership verification TXT records */}
                          {!domain.verified && domain.verification.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                Also add this record to verify domain ownership:
                              </p>
                              <div className="grid gap-2">
                                {domain.verification.map((v, i) => (
                                  <div
                                    key={i}
                                    className="grid grid-cols-[3rem_1fr] gap-x-6 gap-y-1 rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-mono"
                                  >
                                    <span className="text-muted-foreground not-italic font-sans font-medium">Type</span>
                                    <span>{v.type}</span>
                                    <span className="text-muted-foreground not-italic font-sans font-medium">Name</span>
                                    <span className="break-all">{v.domain}</span>
                                    <span className="text-muted-foreground not-italic font-sans font-medium">Value</span>
                                    <span className="break-all">{v.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Domain</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <code className="font-mono text-sm text-foreground">{deleteTarget?.name}</code>{" "}
              from this project? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPendingDelete}>
              {isPendingDelete ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DomainDialog
        projectId={projectId}
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={handleAdded}
      />
    </div>
  );
}
