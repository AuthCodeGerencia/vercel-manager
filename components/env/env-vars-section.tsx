"use client";

import { useState, useTransition } from "react";
import { PlusIcon, PencilIcon, Trash2Icon, EyeIcon, EyeOffIcon, CopyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { EnvDialog } from "./env-dialog";
import { deleteEnvVarAction, revealEnvVarAction } from "@/lib/actions";
import { toast } from "sonner";

interface EnvVar {
  id: string;
  key: string;
  value: string;
  type: string;
  target: string[];
}

const TARGET_COLORS: Record<string, string> = {
  production: "bg-black text-white dark:bg-white dark:text-black",
  preview: "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100",
  development: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600",
};

function RevealCell({ env, projectId }: { env: EnvVar; projectId: string }) {
  const [revealed, setRevealed] = useState(false);
  const [decryptedValue, setDecryptedValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, startTransition] = useTransition();

  function handleToggle() {
    if (revealed) {
      setRevealed(false);
      return;
    }
    if (decryptedValue !== null) {
      setRevealed(true);
      return;
    }
    startTransition(async () => {
      try {
        const result = await revealEnvVarAction(projectId, env.id);
        setDecryptedValue(result.value);
        setRevealed(true);
      } catch {
        toast.error("Failed to reveal value");
      }
    });
  }

  function handleCopy() {
    const val = decryptedValue ?? env.value;
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const displayValue = revealed && decryptedValue !== null ? decryptedValue : "••••••••";

  return (
    <div className="flex items-center gap-1.5 group/cell">
      <span className="font-mono text-sm text-muted-foreground select-none">
        {displayValue}
      </span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover/cell:opacity-100 transition-opacity">
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          title={revealed ? "Hide value" : "Reveal value"}
        >
          {isLoading ? (
            <span className="h-3.5 w-3.5 block animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : revealed ? (
            <EyeOffIcon className="h-3.5 w-3.5" />
          ) : (
            <EyeIcon className="h-3.5 w-3.5" />
          )}
        </button>
        {(revealed || env.type === "plain") && (
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Copy value"
          >
            {copied ? (
              <CheckIcon className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <CopyIcon className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function EnvVarsSection({
  projectId,
  envs,
}: {
  projectId: string;
  envs: EnvVar[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editEnv, setEditEnv] = useState<EnvVar | null>(null);
  const [deleteEnv, setDeleteEnv] = useState<EnvVar | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteEnv?.id) return;
    startTransition(async () => {
      try {
        await deleteEnvVarAction(projectId, deleteEnv.id);
        toast.success("Variable deleted");
        setDeleteEnv(null);
      } catch (err) {
        toast.error("Failed to delete variable", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Environment Variables</h2>
          <p className="text-sm text-muted-foreground">
            {envs.length} variable{envs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="mr-1.5 h-4 w-4" />
          Add Variable
        </Button>
      </div>

      {envs.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No environment variables yet. Add one to get started.
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono w-72">Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Environments</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {envs.map((env) => (
                <TableRow key={env.id} className="group">
                  <TableCell className="font-mono text-sm font-medium">
                    {env.key}
                  </TableCell>
                  <TableCell>
                    <RevealCell env={env} projectId={projectId} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {env.target.map((t) => (
                        <span
                          key={t}
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TARGET_COLORS[t] ?? "bg-zinc-100 text-zinc-700"}`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditEnv(env)}
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteEnv(env)}
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EnvDialog
        projectId={projectId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {editEnv && (
        <EnvDialog
          projectId={projectId}
          open={!!editEnv}
          onOpenChange={(open) => !open && setEditEnv(null)}
          existing={editEnv}
        />
      )}

      <Dialog open={!!deleteEnv} onOpenChange={(open) => !open && setDeleteEnv(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Variable</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <code className="font-mono text-sm text-foreground">{deleteEnv?.key}</code>?
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEnv(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
