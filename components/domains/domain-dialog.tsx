"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addProjectDomainAction } from "@/lib/actions";
import { toast } from "sonner";

interface DomainDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: (domain: { name: string; verified: boolean; verification: { type: string; domain: string; value: string; reason: string }[] }) => void;
}

export function DomainDialog({ projectId, open, onOpenChange, onAdded }: DomainDialogProps) {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      try {
        const result = await addProjectDomainAction(projectId, name.trim());
        toast.success(`Domain ${result.name} added`);
        setName("");
        onOpenChange(false);
        onAdded(result);
      } catch (err) {
        toast.error("Failed to add domain", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Domain</DialogTitle>
          <DialogDescription>
            Add a custom domain to this project. You may need to verify ownership
            after adding.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="domain-name" className="text-sm font-medium">Domain</label>
            <Input
              id="domain-name"
              placeholder="example.com"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Adding…" : "Add Domain"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
